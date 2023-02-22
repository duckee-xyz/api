import { ConfigKey } from '~/utils';

export class GoogleConfig {
  @ConfigKey({ env: 'GOOGLE_CLIENT_ID', errorIfNotGiven: true })
  googleClientId: string;
}
