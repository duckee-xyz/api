import { randomBytes } from 'crypto';
import { injectable } from 'inversify';

/**
 * Generates a private key and creates a Flow account.
 */
@injectable()
export class CreateWallet {
  constructor() {}

  async call(): Promise<string> {
    return '0x' + randomBytes(8).toString('hex');
  }
}
