import { Request } from 'koa';
import { Container } from 'typedi';
import { Authenticate } from '~/auth';
import { AuthError } from '~/errors';
import { User } from '~/user';

/**
 * This method is being imported by `tsoa.json`
 */
export async function koaAuthentication(request: Request, securityName: string, scopes?: string[]): Promise<User> {
  if (securityName === 'JWT') {
    const accessToken = parseAuthorizationHeader(request.headers['authorization']);
    return Container.get(Authenticate).call(accessToken);
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
