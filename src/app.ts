import { log } from 'pine-log';
import 'reflect-metadata';
import { createServer } from './api';
import { initializeDependency } from './initializeDependency';
import { sleep } from './utils';

async function main() {
  const { config } = await initializeDependency();

  const server = createServer(config.env);
  server.listen(config.port, () => log.info(`now listening on`, { host: `http://localhost:${config.port}` }));
}

if (require.main === module) {
  main().catch((err) => {
    log.error('unable to start up', err);
    sleep(1000).then(() => (process.exitCode = 1));
  });
}
