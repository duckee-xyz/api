import { ConfigKey } from '~/utils';

export class AuthConfig {
  @ConfigKey({ env: 'AUTH_JWT_SECRET', default: 'abracadabra.money', warnIfNotGiven: 'production' })
  jwtSecret: string;

  @ConfigKey({ default: '7 days' })
  accessTokenExpiresIn: TimeSpan;

  @ConfigKey({ default: '60 days' })
  refreshTokenExpiresIn: TimeSpan;

  @ConfigKey({ env: 'AUTH_APPLE_CLIENT_ID', errorIfNotGiven: 'production' })
  appleClientId: string;

  @ConfigKey({ env: 'AUTH_TEST_LOGIN_SECRET', default: 'iamtest' })
  testLoginSecret: string;
}

/**
 * expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).
 * Eg: 60, "2 days", "10h", "7d"
 */
type TimeSpan = string | number;
