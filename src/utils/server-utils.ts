import koa from 'koa';
import { User } from '../user';

export interface AuthRequest extends koa.Request {
  user: User;
}
