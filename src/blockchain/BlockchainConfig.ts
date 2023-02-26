import { Environment } from '@onflow/fcl';
import { ConfigKey } from '../utils';

export class BlockchainConfig {
  @ConfigKey({ env: 'FLOW_NETWORK', default: 'testnet' })
  flowNetwork: Environment;

  @ConfigKey({ env: 'ADMIN_ADDRESS', default: '0xfe9604dcbf6b270e' })
  adminAddress: string;

  @ConfigKey({ env: 'ADMIN_KEY_INDEX', default: '0' })
  adminKeyIndex: number;

  @ConfigKey({ env: 'ADMIN_PRIVATE_KEY', warnIfNotGiven: true })
  adminPrivateKey: string;
}
