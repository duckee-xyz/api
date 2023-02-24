import { Get, Request, Route } from '@tsoa/runtime';
import { formatDistanceToNowStrict } from 'date-fns';
import koa from 'koa';
import { every } from 'lodash';
import { Service } from 'typedi';
import { DataSource } from 'typeorm';

@Route('/')
@Service()
export class RootController {
  private startedAt: Date;

  constructor(private dataSource: DataSource) {
    this.startedAt = new Date();
  }

  @Get('/')
  async root() {
    return {
      message: 'all systems go',
      startedAt: this.startedAt.toISOString(),
      uptime: formatDistanceToNowStrict(this.startedAt),
    };
  }

  /**
   * @summary Check Service Health
   */
  @Get('/healthz')
  async healthCheck(@Request() { ctx }: koa.Request) {
    const healths = {
      database: await isSuccessful(() => this.dataSource.query('SELECT 1=1')),
    };
    ctx.response.status = every(Object.values(healths)) ? 200 : 500;
    return healths;
  }
}

const isSuccessful = async (fn: () => Promise<any>): Promise<boolean> => {
  try {
    await fn();
    return true;
  } catch (ignored) {
    return false;
  }
};
