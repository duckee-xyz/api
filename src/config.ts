import { AuthConfig } from '~/auth';
import { FirebaseConfig } from '~/integration/firebase';
import { ChildConfig, ConfigKey } from '~/utils';
import { DatabaseConfig } from './database';
import { GenerationConfig } from './generation/GenerationConfig';

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

  @ChildConfig(() => FirebaseConfig)
  firebase: FirebaseConfig;

  @ChildConfig(() => GenerationConfig)
  generation: GenerationConfig;
}
