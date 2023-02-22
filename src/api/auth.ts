import koa, { Request } from 'koa';
import { Authenticate } from '~/auth';
import { User } from '~/user';
import { CONTAINER } from '../ioc';
import { AuthError } from './errors';

export interface AuthRequest extends koa.Request {
  user: User;
}

/**
 * This method is being imported by `tsoa.json`
 */
export async function koaAuthentication(request: Request, securityName: string, scopes?: string[]): Promise<User> {
  if (securityName === 'JWT') {
    const accessToken = parseAuthorizationHeader(request.headers['authorization']);
    return CONTAINER.get(Authenticate).call(accessToken);
  }
  throw new Error(`Unknown Security Name: ${securityName}`);
}

/**
 * Verifies Authorization header (e.g."Bearer eyJhbGci...") and extracts an token from it.
 * @param header Authorization header in HTTP request
 */
const parseAuthorizationHeader = (header?: string): string => {
  if (!header) {
    throw new AuthError('missing Authorization header');
  }
  const headerFragments = header.split(' ');
  if (!headerFragments || headerFragments.length !== 2 || headerFragments[0] !== 'Bearer') {
    throw new AuthError('check Authorization header');
  }
  return headerFragments[1];
};
