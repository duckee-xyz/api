import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from '../utils';
import { CustodialWalletEntity } from './entities';
import { Wallet } from './wallets';

@Service()
export class BlockchainRepository {
  constructor(
    @InjectRepository(CustodialWalletEntity) private custodialWalletRepo: Repository<CustodialWalletEntity>,
  ) {}

  async saveCustodialWallet(wallet: Wallet) {
    await this.custodialWalletRepo.save({
      address: wallet.address,
      wallet,
    });
  }

  async loadCustodialWallet(address: string): Promise<Wallet> {
    const entity = await this.custodialWalletRepo.findOneByOrFail({ address });
    return entity.wallet;
  }
}
