import axios, { Axios } from 'axios';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';
import { initializeFcl } from './blockchain';
import { Config } from './config';
import { initializeDatabase } from './database';
import { loadConfig, registerForInjectRepository } from './utils';

export async function initializeDependency() {
  const config = loadConfig(Config, {
    iocHook: (type, object) => Container.set(type, object),
  });
  const database = await initializeDatabase(config.database);
  Container.set(DataSource, database);
  registerForInjectRepository(database);

  initializeFcl(config.blockchain);

  Container.set(
    Axios,
    axios.create({
      timeout: 5000,
      validateStatus: () => true,
    }),
  );

  return { config };
}
