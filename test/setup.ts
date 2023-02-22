import { resolve } from 'path';
import { DataSource, QueryRunner } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { CONTAINER } from '../src/ioc';

const ISOLATED_RUNNER_TYPE = Symbol('ISOLATED_RUNNER_TYPE');

type TestType = 'unit' | 'integration' | 'e2e';

/**
 * @returns whether the test is skipped or not.
 */
export function setupAraTest(testType: TestType = 'unit'): boolean {
  const currentTestMode = (process.env['ARA_TEST'] ?? 'unit') as TestType;
  if (currentTestMode !== testType) {
    console.log(`skipping ${testType} test (currently in ${currentTestMode} test mode)`);
    it('skipped', () => {});
    return false;
  }

  if (testType === 'e2e') {
    return true;
  }

  const dbConfig =
    testType === 'unit'
      ? ({ type: 'sqlite', database: ':memory:' } as SqliteConnectionOptions)
      : ({
        type: 'mysql',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER ?? 'cosmo',
        password: process.env.DB_PW ?? 'cosmo',
        database: process.env.DB_DATABASE ?? 'cosmo',
      } as MysqlConnectionOptions);

  beforeAll(async () => {
    const database = new DataSource({
      ...dbConfig,
      entities: [resolve(__dirname, '../src') + '/**/entities/*'],
      synchronize: true,
      logging: ['error'],
    });
    CONTAINER.bind(DataSource).toConstantValue(database);

    const isolatedRunner = await database.createQueryRunner();
    await isolatedRunner.connect();

    CONTAINER.bind<QueryRunner>(ISOLATED_RUNNER_TYPE).toConstantValue(isolatedRunner);
  });

  beforeEach(async () => {
    await CONTAINER.get<QueryRunner>(ISOLATED_RUNNER_TYPE).startTransaction();
  });

  afterEach(async () => {
    await CONTAINER.get<QueryRunner>(ISOLATED_RUNNER_TYPE).rollbackTransaction();
  });
  return true;
}

export function resolveTestParamFromEnv(envNames: string[]): string[] {
  return envNames.map((envName) => {
    const envValue = process.env[envName];
    if (envValue == null) {
      throw new Error(`missing test parameter: ${envName} is required as environment variable`);
    }
    return envValue;
  });
}
