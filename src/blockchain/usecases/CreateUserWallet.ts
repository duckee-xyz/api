import { Service } from 'typedi';
import CREATE_WALLETLESS_ACCOUNT from '../../../cadence/transactions/create-walletless-account';
import { BlockchainRepository } from '../BlockchainRepository';
import { waitForTx } from '../transactions';
import { generateKeys } from '../utils';
import { AdminWallet, Wallet } from '../wallets';

const FLOW_CHARGE_AMOUNT = '0.1';
const ACCOUNT_NAME = 'Duckee Account';
const ACCOUNT_DESCRIPTION = 'Proxy Account for Duckee';
const APP_LOGO = 'https://static.duckee.xyz/logo.png';
const APP_URL = 'https://duckee.xyz/';

/**
 * Generates a private key and creates a Flow account.
 */
@Service()
export class CreateUserWallet {
  constructor(private adminWallet: AdminWallet, private blockchainRepository: BlockchainRepository) {}

  async call(): Promise<Wallet> {
    const { privateKey, publicKey } = await generateKeys();

    const txId = await this.adminWallet.mutate(CREATE_WALLETLESS_ACCOUNT, (arg: any, t: any) => [
      arg(publicKey, t.String),
      arg(FLOW_CHARGE_AMOUNT, t.UFix64),
      arg(ACCOUNT_NAME, t.String),
      arg(ACCOUNT_DESCRIPTION, t.String),
      arg(APP_LOGO, t.String),
      arg(APP_URL, t.String),
    ]);
    const { events } = await waitForTx(txId);

    const address = events.find((it: any) => it.type === 'flow.AccountCreated')?.data?.address as string;
    if (!address) {
      throw new Error(`flow.AccountCreated event not found on ${txId}: raw events are ${JSON.stringify(events)}`);
    }

    const wallet = {
      address,
      keyIndex: 0,
      privateKey,
      publicKey,
    };
    await this.blockchainRepository.saveCustodialWallet(wallet);
    return wallet;
  }
}
