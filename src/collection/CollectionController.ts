import { Get, Path, Query, Route, Security, Tags } from '@tsoa/runtime';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Art, ArtEntity, ArtRepository } from '../art';
import { ArtLike } from '../art/entities/ArtLike';
import { NotFoundError } from '../errors';
import { PaymentLogEntity } from '../payment';
import { UserEntity } from '../user';
import { InjectRepository, paginatedFindBy, PaginatedResult } from '../utils';

@Service()
@Tags('Collection')
@Route('/collection/v1')
export class CollectionController {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(ArtEntity) private artRepo: Repository<ArtEntity>,
    @InjectRepository(ArtLike) private artLikeRepo: Repository<ArtLike>,
    @InjectRepository(PaymentLogEntity) private paymentLogRepo: Repository<PaymentLogEntity>,
    private artRepository: ArtRepository,
  ) {}

  @Get('/user/:userId/listed')
  @Security('JWT')
  async listListed(
    @Path() userId: number,
    @Query('start_after') startAfter?: string,
    @Query('limit') limit?: number,
    @Query() tags: string[] = [],
  ): Promise<PaginatedResult<Art>> {
    const { hasNext, results, total } = await paginatedFindBy(
      this.artRepo,
      {
        where: { owner: { id: userId } },
        order: { createdAt: 'DESC' },
      },
      { startAfter, limit },
    );
    return {
      hasNext,
      results: await Promise.all(results.map((it) => this.artRepository.mapEntityToModel(it))),
      total,
    };
  }

  @Get('/user/:userId/bought')
  @Security('JWT')
  async listBought(
    @Path() userId: number,
    @Query('start_after') startAfter?: string,
    @Query('limit') limit?: number,
    @Query() tags: string[] = [],
  ): Promise<PaginatedResult<Art>> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError('user not found');
    }
    const { hasNext, results, total } = await paginatedFindBy(
      this.paymentLogRepo,
      {
        where: { address: user.address, status: 'succeed' },
        order: { createdAt: 'DESC' },
        relations: { art: true },
      },
      { startAfter, limit },
    );
    return {
      hasNext,
      results: await Promise.all(results.map((it) => this.artRepository.mapEntityToModel(it.art))),
      total,
    };
  }

  @Get('/user/:userId/liked')
  @Security('JWT')
  async listLiked(
    @Path() userId: number,
    @Query('start_after') startAfter?: string,
    @Query('limit') limit?: number,
    @Query() tags: string[] = [],
  ): Promise<PaginatedResult<Art>> {
    const { hasNext, results, total } = await paginatedFindBy(
      this.artLikeRepo,
      {
        where: { user: { id: userId } },
        order: { art: { createdAt: 'DESC' } },
        relations: { art: true },
      },
      { startAfter, limit },
    );
    return {
      hasNext,
      results: await Promise.all(results.map((it) => this.artRepository.mapEntityToModel(it.art))),
      total,
    };
  }
}
