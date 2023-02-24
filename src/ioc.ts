import { IocContainer } from '@tsoa/runtime';
import { Constructable, Container } from 'typedi';

// referenced by tsoa
export const iocContainer: IocContainer = {
  get<T>(controller: { prototype: T }): T {
    return Container.get(controller as Constructable<T>);
  },
};
