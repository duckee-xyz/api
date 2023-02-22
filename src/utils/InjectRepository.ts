import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { CONTAINER } from '../ioc';

type Newable<T> = new (...args: never[]) => T;

export function InjectRepository<T extends ObjectLiteral>(entityType: Newable<T>): CallableFunction {
  return (object: object, propertyName: string | symbol, index?: number): void => {
    CONTAINER.bind<T>(entityType).toProvider<Repository<T>>(
      (context) => async () => context.container.get(DataSource).getRepository(entityType),
    );
  };
}
