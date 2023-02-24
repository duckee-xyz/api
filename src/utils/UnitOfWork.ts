import { every } from 'lodash';
import { log } from 'pine-log';
import { Constructable, Container, Handler, Inject, Service } from 'typedi';
import { DataSource, EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { DATASOURCE, getInjectedEntity } from './InjectRepository';
import { useRequestScope } from './request-scope';

const ONGOING_TXN_KEY = 'ongoing-transaction';
const NOT_IN_TYPEDI = Symbol('NOT_IN_TYPEDI');

@Service()
export class UnitOfWork {
  constructor(@Inject(DATASOURCE) private dataSource: DataSource) {}

  async transaction<T>(fn: (tx: UnitOfWorkTransaction) => Promise<T>, isolationLevel?: IsolationLevel): Promise<T> {
    const ongoingTxn = this.getOngoingTransaction();
    if (!ongoingTxn) {
      try {
        const txnFn = async (tx: EntityManager) => {
          const ongoingTxn = new UnitOfWorkTransaction(tx);
          this.setOngoingTxnOnRequestScope(ongoingTxn);

          return fn(ongoingTxn);
        };
        if (isolationLevel) {
          return await this.dataSource.transaction(isolationLevel, txnFn);
        }
        return await this.dataSource.transaction(txnFn);
      } finally {
        this.setOngoingTxnOnRequestScope(null);
      }
    }
    // avoid nested transaction if we're already on a txn
    log.trace('skip nested transaction');
    return await fn(ongoingTxn);
  }

  isTransactionEnabled(): boolean {
    return !!this.getOngoingTransaction();
  }

  getOngoingTransaction(): UnitOfWorkTransaction | undefined {
    return useRequestScope()?.get(ONGOING_TXN_KEY);
  }

  private setOngoingTxnOnRequestScope(txn: UnitOfWorkTransaction | null) {
    useRequestScope()?.set(ONGOING_TXN_KEY, txn);
  }
}

export class UnitOfWorkTransaction {
  private logDepth = 0;
  private dependencyCache = new Map<object, any>();

  constructor(private readonly tx: EntityManager, private verbose = !!process.env['LOG_UOT_INJECTIONS']) {}

  getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
    return this.tx.getRepository(target);
  }

  /**
   * This is UnitOfWork version of `Container.get`— which creates a new instance of given type by
   * injecting dependencies from TypeDI, but replacing TypeORM repositories from the ongoing transaction.
   *
   * @param type TypeDI-injectable Service Type (with @Service decorator)
   */
  inject<T>(type: Constructable<T>): T {
    if (this.dependencyCache.has(type)) {
      this.trace(`${type.name} -> CACHED`);
      return this.dependencyCache.get(type);
    }

    const paramTypes: Constructable<any>[] = Reflect.getMetadata('design:paramtypes', type) ?? [];
    this.traceBegin(type, paramTypes);

    const paramValues = paramTypes.map((paramType, index) => {
      const entity = getInjectedEntity(type, index);
      if (entity) {
        this.trace(`${index + 1}. ${paramType.name}<${(entity as any).name}> -> injected TypeORM Repository!`);
        return this.getRepository(entity);
      }
      if (!Container.has(paramType)) {
        // check that it used @Inject() decorator on interface type
        const handler = this.findTypeDIHandler(type, paramType, index);
        if (handler) {
          this.trace(`${index + 1}. ${paramType.name} -> @Inject(...)`);
          return handler.value(Container.of());
        }

        // the `type` has already reached the leaf node of the dependency graph.
        // not able to continue further
        this.trace(`${index + 1}. ${paramType.name} -> not in TypeDI`);
        return NOT_IN_TYPEDI;
      }
      // so the type is in TypeDI: try to traverse more
      return this.inject(paramType);
    });
    if (every(paramValues, (it) => it === NOT_IN_TYPEDI)) {
      // the `type` is a leaf node of the dependency graph. get from TypeDI
      const valueFromTypeDI = Container.get(type);
      this.dependencyCache.set(type, valueFromTypeDI);
      this.traceEnd(type, ' -> (TypeDI)');

      return valueFromTypeDI;
    }
    this.traceEnd(type);

    const instance = new type(...paramValues);
    this.dependencyCache.set(type, instance);
    return instance;
  }

  findTypeDIHandler(type: Constructable<any>, paramType: any, paramIndex: number): Handler | undefined {
    // copied from TypeDI code. see ContainerInstance.initializeParams()
    return Container.handlers.find(
      (handler) =>
        (handler.object === type || handler.object === Object.getPrototypeOf(type)) && handler.index === paramIndex,
    );
  }

  trace(message: string) {
    if (!this.verbose) {
      return;
    }
    log.trace('│ '.repeat(this.logDepth) + message);
  }

  traceBegin(type: any, paramTypes: any[]) {
    this.trace(`${type.name} BEGIN (${paramTypes.map((it) => it?.name ?? typeof it).join(',')})`);
    this.logDepth += 1;
  }

  traceEnd(type: any, msg = '') {
    this.logDepth -= 1;
    this.trace(`${type.name} END${msg}`);
  }
}

export function Transactional(isolationLevel?: IsolationLevel): CallableFunction {
  return (instance: any, functionName: string | symbol, desc: PropertyDescriptor): void => {
    const targetType = instance.constructor;
    const originalMethod = desc.value;

    desc.value = (...args: any[]) =>
      Container.get(UnitOfWork).transaction(async (tx) => {
        // create a new copy of `this` (for replacing TypeORM repositories) and replace it.
        const newInstance = tx.inject(targetType);
        return originalMethod.apply(newInstance, args);
      }, isolationLevel);
  };
}
