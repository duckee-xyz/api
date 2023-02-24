import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository, paginatedFindBy, PaginatedResult, PaginationOptions } from '~/utils';
import { NotFoundError } from '../errors';
import { User } from '../user';
import { ArtEntity } from './entities';
import { Art, ArtCreation, ArtDetails } from './models';

interface ListFilter {
  parentTokenId: number;
  owner: number;
  tags: string[];
}

@Service()
export class ArtRepository {
  constructor(@InjectRepository(ArtEntity) private artRepo: Repository<ArtEntity>) {}

  async create(creation: ArtCreation): Promise<ArtDetails> {
    const art = await this.artRepo.save(creation);
    return this.details(art.owner, art.tokenId);
  }

  async list(filter: Partial<ListFilter> = {}, pagination?: PaginationOptions): Promise<PaginatedResult<Art>> {
    const { hasNext, results, total } = await paginatedFindBy(
      this.artRepo,
      {
        where: filter.parentTokenId ? { parentTokenId: filter.parentTokenId } : {},
        order: { createdAt: 'DESC' },
      },
      pagination,
    );
    return {
      hasNext,
      results: results.map((it) => it.toModel()),
      total,
    };
  }

  async get(tokenId: number): Promise<Art> {
    const entity = await this.artRepo.findOneBy({ tokenId });
    if (!entity) {
      throw new NotFoundError();
    }
    return entity.toModel();
  }

  async details(requestor: User, tokenId: number): Promise<ArtDetails> {
    const entity = await this.artRepo.findOneBy({ tokenId });
    if (!entity) {
      throw new NotFoundError();
    }

    const parentToken = await this.artRepo.findOneBy({ tokenId: entity.parentTokenId });
    const derivedTokens = await this.artRepo.findBy({ parentTokenId: tokenId });
    const hasAccessibleToRecipe = entity.priceInFlow === 0 || requestor.address === entity.owner.address;
    return {
      ...entity.toModel(),
      recipe: hasAccessibleToRecipe ? entity.recipe : null,
      parentToken: parentToken?.toModel(),
      derivedTokens: derivedTokens.map((it) => it.toModel()),
    };
  }
}
