import { Constructable, Container, Token } from 'typedi';
import { ContainerInstance } from 'typedi/types/container-instance.class';
import { DataSource, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

export const DATASOURCE = new Token<DataSource>();
const ACTIVE_ENTITY_MANAGER = new Token<EntityManager>();
const ENTITY_TYPE_METADATA = Symbol('entityType');

interface EntityTypeMetadata {
  entityType: EntityTarget<any>;
  index: number;
}

export function registerForInjectRepository(dataSource: DataSource, activeTransaction?: EntityManager) {
  Container.set(DATASOURCE, dataSource);
  Container.set(ACTIVE_ENTITY_MANAGER, activeTransaction ?? dataSource);
}

export function InjectRepository<T extends ObjectLiteral>(entityType: EntityTarget<T>): CallableFunction {
  return (object: object, propertyName: string | symbol, index?: number): void => {
    const metadata: EntityTypeMetadata = {
      entityType,
      index: index!,
    };
    const existingMetadata = Reflect.getMetadata(ENTITY_TYPE_METADATA, object) ?? [];
    Reflect.defineMetadata(ENTITY_TYPE_METADATA, [...existingMetadata, metadata], object);

    Container.registerHandler({
      object: object as Constructable<unknown>,
      index: index,
      propertyName: propertyName as string,
      value: (container: ContainerInstance) => container.get(ACTIVE_ENTITY_MANAGER).getRepository(entityType),
    });
  };
}

export function getInjectedEntity(object: object, paramIndex: number): EntityTarget<any> | undefined {
  const metadata: EntityTypeMetadata[] = Reflect.getMetadata(ENTITY_TYPE_METADATA, object) ?? [];
  return metadata.find((it) => it.index === paramIndex)?.entityType;
}
