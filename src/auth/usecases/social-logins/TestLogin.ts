import { randomBytes, randomUUID } from 'crypto';
import { Service } from 'typedi';
import { User } from '~/user';
import { ValidationError } from '../../../errors';
import { AuthConfig } from '../../AuthConfig';
import { SocialLoginChannel, SocialLoginVerifyResult } from './types';

@Service()
export class TestLogin implements SocialLoginChannel {
  constructor(private authConfig: AuthConfig) {}

  async findUserByEmail(email: string): Promise<User | undefined> {
    return;
  }

  /**
   */
  async verifyToken(token: string): Promise<SocialLoginVerifyResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new ValidationError('unsupported method');
    }
    if (token !== this.authConfig.testLoginSecret) {
      throw new ValidationError('secret mismatch');
    }
    return {
      userId: 'test:' + randomUUID(),
      email: `${randomBytes(8).toString('hex')}}@test.com`,
      credentials: '',
    };
  }

  async saveCredential(user: User, { email, userId, credentials }: SocialLoginVerifyResult) {}
}
