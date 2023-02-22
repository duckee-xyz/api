import axios, { Axios } from 'axios';
import { DataSource } from 'typeorm';
import { Config } from './config';
import { initializeDatabase } from './database';
import { CONTAINER } from './ioc';
import { loadConfig } from './utils';

export async function initializeDependency(container = CONTAINER) {
  const config = loadConfig(Config, {
    iocHook: (type, object) => container.bind(type).toConstantValue(object),
  });
  const database = await initializeDatabase(config.database);
  container.bind(DataSource).toConstantValue(database);

  container.bind(Axios).toProvider(() =>
    axios.create({
      timeout: 5000,
      validateStatus: () => true,
    }),
  );

  return { config, container };
}
