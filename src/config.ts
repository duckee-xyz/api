import { AuthConfig } from '~/auth';
import { FirebaseConfig } from '~/integration/firebase';
import { ChildConfig, ConfigKey } from '~/utils';
import { BlockchainConfig } from './blockchain';
import { DatabaseConfig } from './database';
import { GenerationConfig } from './generation/GenerationConfig';
import { PaymentConfig } from './payment/PaymentConfig';

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

  @ChildConfig(() => BlockchainConfig)
  blockchain: BlockchainConfig;

  @ChildConfig(() => DatabaseConfig)
  database: DatabaseConfig;

  @ChildConfig(() => AuthConfig)
  auth: AuthConfig;

  @ChildConfig(() => FirebaseConfig)
  firebase: FirebaseConfig;

  @ChildConfig(() => GenerationConfig)
  generation: GenerationConfig;

  @ChildConfig(() => PaymentConfig)
  payment: PaymentConfig;
}
