import { ErrorWithHttpStatus } from '~/errors';
import { SocialLoginType } from './types';

export class AuthError extends ErrorWithHttpStatus {
  constructor(public details?: string) {
    super(401, 'unauthorized', {}, details);
  }
}

export class NoAccount extends ErrorWithHttpStatus {
  constructor(public details?: string) {
    super(400, 'please sign up');
  }
}

export class UseOtherLoginChannel extends ErrorWithHttpStatus {
  constructor(public otherChannel: SocialLoginType) {
    super(400, 'use other login channel', { otherChannel });
  }
}
