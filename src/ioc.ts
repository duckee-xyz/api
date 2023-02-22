import { IocContainer } from '@tsoa/runtime';
import { Container } from 'inversify';

export const CONTAINER = new Container({ autoBindInjectable: true });
export const TYPES = {};

// referenced by tsoa
export const iocContainer: IocContainer = {
  get: <T>(controller: { prototype: T }): T => CONTAINER.get(controller),
};
