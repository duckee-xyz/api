import { Body, Get, Path, Post, Query, Request, Route, Security, Tags } from '@tsoa/runtime';
import { Service } from 'typedi';
import { AuthRequest, PaginatedResult } from '~/utils';
import { ArtRepository } from './ArtRepository';
import { Art, ArtCreation } from './models';

@Service()
@Tags('Art')
@Route('/art/v1')
export class ArtController {
  constructor(private artRepository: ArtRepository) {}

  /**
   * @summary Upload & Mint Art NFT
   */
  @Post('/')
  @Security('JWT')
  async create(@Request() { user }: AuthRequest, @Body() creation: ArtCreation) {
    const artDetails = await this.artRepository.create(creation);
    return { artDetails };
  }

  /**
   * @summary Load Art NFT Feed in Explore tab
   */
  @Get('/')
  async list(
    @Query('start_after') startAfter?: string,
    @Query('limit') limit?: number,
    @Query() tags: string[] = [],
  ): Promise<PaginatedResult<Art>> {
    return await this.artRepository.list({ tags }, { startAfter, limit });
  }

  /**
   * @param tokenId
   * @summary Get public art NFT information
   */
  @Get('/:tokenId')
  async get(@Path() tokenId: number) {
    const art = await this.artRepository.get(tokenId);
    return { art };
  }

  /**
   * @param tokenId
   * @summary Get art NFT details, including Recipe
   */
  @Get('/:tokenId/details')
  @Security('JWT')
  async details(@Request() { user }: AuthRequest, @Path() tokenId: number) {
    const artDetails = await this.artRepository.details(user, tokenId);
    return { artDetails };
  }
}
