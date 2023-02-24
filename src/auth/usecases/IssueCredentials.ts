import { Service } from 'typedi';
import { User } from '~/user';
import { AuthConfig } from '../AuthConfig';
import { Credentials, TokenType } from '../types';
import { issueJWT } from './jwt-utils';

@Service()
export class IssueCredentials {
  constructor(private authConfig: AuthConfig) {}

  call(user: User): Credentials {
    return {
      accessToken: issueJWT(TokenType.ACCESS, user, this.authConfig.accessTokenExpiresIn, this.authConfig.jwtSecret),
      refreshToken: issueJWT(TokenType.REFRESH, user, this.authConfig.refreshTokenExpiresIn, this.authConfig.jwtSecret),
    };
  }
}
