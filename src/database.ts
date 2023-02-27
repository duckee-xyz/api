import { DataSource } from 'typeorm';
import { ConfigKey } from '~/utils';
import { ART_ENTITIES } from './art';
import { BLOCKCHAIN_ENTITIES } from './blockchain';
import { GENERATION_ENTITIES } from './generation';
import { FIREBASE_INTEGRATION_ENTITIES } from './integration/firebase';
import { PAYMENT_ENTITIES } from './payment';
import { USER_ENTITIES } from './user';

export class DatabaseConfig {
  @ConfigKey({ env: 'DB_HOST', default: 'localhost', warnIfNotGiven: 'production' })
  host: string;

  @ConfigKey({ env: 'DB_PORT', default: 3306 })
  port: number;

  @ConfigKey({ env: 'DB_USER', default: 'duckee' })
  username: string;

  @ConfigKey({ env: 'DB_PW', default: 'duckee' })
  password: string;

  @ConfigKey({ env: 'DB_DATABASE', default: 'duckee' })
  database: string;

  @ConfigKey({ env: 'DB_LOG_QUERY', default: { production: false, default: true } })
  logQuery: boolean;
}

export const initializeDatabase = async (config: DatabaseConfig): Promise<DataSource> => {
  const dataSource = new DataSource({
    ...config,
    type: 'mysql',
    entities: [
      ...ART_ENTITIES,
      ...USER_ENTITIES,
      ...FIREBASE_INTEGRATION_ENTITIES,
      ...GENERATION_ENTITIES,
      ...BLOCKCHAIN_ENTITIES,
      ...PAYMENT_ENTITIES,
    ],
    synchronize: true,
    timezone: 'Z',
    logging: config.logQuery ? ['migration', 'schema', 'error'] : ['migration', 'schema'],
  });
  return dataSource.initialize();
};
