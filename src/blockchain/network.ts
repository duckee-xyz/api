import { Environment } from '@onflow/fcl';

export const ACCESS_NODE_URLS: { [network in Environment]: string } = {
  local: 'http://localhost:8888',
  testnet: 'https://rest-testnet.onflow.org',
  mainnet: 'https://rest-mainnet.onflow.org',
  canarynet: '',
  sandboxnet: '',
};

export const BLOCK_EXPLORER_URLS: { [k: string]: string } = {
  testnet: 'https://testnet.flowscan.org',
  mainnet: 'https://flowscan.org',
};
