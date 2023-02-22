import { AuthConfig } from '~/auth';
import { GoogleConfig } from '~/integration/google';
import { ChildConfig, ConfigKey } from '~/utils';
import { DatabaseConfig } from './database';

export enum Env {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export class Config {
  @ConfigKey({ env: 'NODE_ENV', default: 'development' })
  env: Env;

  @ConfigKey({ env: 'VERBOSE', default: true })
  verbose: boolean;

  @ConfigKey({ env: 'PORT', default: 3000 })
  port: number;

  @ChildConfig(() => DatabaseConfig)
  database: DatabaseConfig;

  @ChildConfig(() => AuthConfig)
  auth: AuthConfig;

  @ChildConfig(() => GoogleConfig)
  google: GoogleConfig;
}
