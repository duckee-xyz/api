import { log } from 'pine-log';
import { Service } from 'typedi';
import { MINT_ART } from '../../../cadence/transactions/mint-art';
import { AdminWallet, BlockchainRepository, UserWallet } from '../../blockchain';
import { User } from '../../user';
import { ArtCreationRequest } from '../ArtController';
import { ArtRepository } from '../ArtRepository';

@Service()
export class CreateArtNFT {
  constructor(
    private artRepository: ArtRepository,
    private blockchainRepo: BlockchainRepository,
    private adminWallet: AdminWallet,
    private userWallet: UserWallet,
  ) {}

  async call(user: User, creation: ArtCreationRequest) {
    const art = await this.artRepository.create({
      ...creation,
      owner: user,
    });

    const txId = await this.adminWallet.mutate(MINT_ART, (arg: any, t: any) => [
      arg(user.address, t.Address),
      arg(String(art.tokenId), t.UInt64),
      arg(art.description ?? '', t.String),
      arg(art.imageUrl, t.String),
      arg(art.parentToken?.tokenId ? String(art.parentToken.tokenId) : null, t.Optional(t.UInt64)),
    ]);
    log.debug(`art NFT is minted`, { txId, tokenId: art.tokenId, address: user.address });

    return art;
  }
}
