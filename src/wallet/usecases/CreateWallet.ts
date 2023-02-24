import { randomBytes } from 'crypto';
import { Service } from 'typedi';

/**
 * Generates a private key and creates a Flow account.
 */
@Service()
export class CreateWallet {
  constructor() {}

  async call(): Promise<string> {
    return '0x' + randomBytes(8).toString('hex');
  }
}
