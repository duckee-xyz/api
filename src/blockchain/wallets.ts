import { ArgumentFunction, AuthorizationObject, mutate, SigningPayload } from '@onflow/fcl';
import { Service } from 'typedi';
import { BlockchainConfig } from './BlockchainConfig';
import { sign } from './utils';

export interface Wallet {
  address: string;
  keyIndex: number;
  publicKey: string;
  privateKey: string;
}

/**
 * Signs transaction by admin wallet.
 */
@Service()
export class AdminWallet {
  constructor(private config: BlockchainConfig) {}

  public adminAuthorization = authorizer({
    address: this.config.adminAddress,
    keyIndex: this.config.adminKeyIndex,
    privateKey: this.config.adminPrivateKey,
    publicKey: '<not-used>',
  });

  /**
   * Mutates the chain by given Cadence transaction.
   * This method does not wait until the transaction to be mined— to wait, use {@link waitForTx} instead.
   *
   * @param cadence transaction script
   * @param args arguments
   * @returns the transaction ID
   */
  async mutate(cadence: string, args?: ArgumentFunction): Promise<string> {
    return mutate({
      cadence,
      args,
      proposer: this.adminAuthorization,
      authorizations: [this.adminAuthorization],
      payer: this.adminAuthorization,
      limit: 9999,
    });
  }
}

/**
 * Signs transaction by user wallet.
 */
@Service()
export class UserWallet {
  constructor(private admin: AdminWallet) {}

  async mutateFromUser(wallet: Wallet, cadence: string, args?: ArgumentFunction) {
    return mutate({
      cadence,
      args,
      proposer: authorizer(wallet),
      authorizations: [authorizer(wallet)],
      payer: this.admin.adminAuthorization,
      limit: 9999,
    });
  }
}

export function authorizer({ address, keyIndex, privateKey }: Wallet) {
  return (account: any): AuthorizationObject => ({
    ...account, // bunch of defaults in here, we want to overload some of them though
    tempId: `${address}-${keyIndex}`, // tempIds are more of an advanced topic, for 99% of the times where you know the address and keyId you will want it to be a unique string per that address and keyId
    addr: address,
    keyId: keyIndex,
    signingFunction: async (signable: SigningPayload) => {
      // Singing functions are passed a signable and need to return a composite signature
      // signable.message is a hex string of what needs to be signed.
      return {
        addr: address,
        keyId: keyIndex,
        signature: await sign(signable.message, privateKey),
      };
    },
  });
}
