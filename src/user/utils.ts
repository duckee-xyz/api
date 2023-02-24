import { useRequestScope } from '../utils';
import { User } from './models';

export function getRequestUser(): User | undefined {
  return useRequestScope()?.get('user');
}
