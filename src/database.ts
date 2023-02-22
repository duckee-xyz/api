import { DataSource } from 'typeorm';
import { ConfigKey } from '~/utils';

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
    entities: [__dirname + '/**/entities/*'],
    synchronize: true,
    timezone: 'Z',
    logging: config.logQuery ? ['migration', 'schema', 'error'] : ['migration', 'schema'],
  });
  return dataSource.initialize();
};
