import { config, Environment } from '@onflow/fcl';
import flowJSON from '../../cadence/flow.json';
import { BlockchainConfig } from './BlockchainConfig';
import { ACCESS_NODE_URLS } from './network';

export function initializeFcl({ flowNetwork }: BlockchainConfig) {
  const cfg = config({
    'flow.network': flowNetwork as Environment,
    'discovery.wallet': `https://fcl-discovery.onflow.org/${flowNetwork}/authn`,
    'accessNode.api': ACCESS_NODE_URLS[flowNetwork],
    // @ts-ignore
    ...Object.fromEntries(Object.entries(flowJSON.contracts).map(([k, v]) => [`0x${k}`, v.aliases[flowNetwork]])),
  });
}
