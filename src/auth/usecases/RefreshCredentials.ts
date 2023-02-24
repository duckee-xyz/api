import { Service } from 'typedi';
import { AuthConfig } from '~/auth/AuthConfig';
import { AuthError } from '~/auth/errors';
import { Credentials, TokenType } from '~/auth/types';
import { UserRepository } from '~/user';
import { IssueCredentials } from './IssueCredentials';
import { verifyJWT } from './jwt-utils';

@Service()
export class RefreshCredentials {
  constructor(
    private authConfig: AuthConfig,
    private userRepository: UserRepository,
    private issueCredentials: IssueCredentials,
  ) {}

  async call(refreshToken: string): Promise<Credentials> {
    const userId = verifyJWT(refreshToken, this.authConfig.jwtSecret, TokenType.REFRESH);
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new AuthError('unknown user ID');
    }
    return this.issueCredentials.call(user);
  }
}
