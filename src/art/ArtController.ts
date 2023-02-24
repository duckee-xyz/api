import { Body, Get, Path, Post, Put, Query, Request, Route, Security, SuccessResponse, Tags } from '@tsoa/runtime';
import Koa from 'koa';
import { Service } from 'typedi';
import { PaginatedResult } from '~/utils';
import { ArtRepository } from './ArtRepository';
import { Art, ArtCreation } from './models';

export type ArtCreationRequest = Omit<ArtCreation, 'owner'>;

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
  @SuccessResponse(201)
  async create(@Request() { user }: Koa.Request, @Body() creation: ArtCreationRequest) {
    const artDetails = await this.artRepository.create({
      ...creation,
      owner: user,
    });
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
  async details(@Request() { user }: Koa.Request, @Path() tokenId: number) {
    const artDetails = await this.artRepository.details(user, tokenId);
    return { artDetails };
  }

  /**
   * @param tokenId
   * @summary Like an art NFT
   */
  @Put('/:tokenId/like')
  @Security('JWT')
  @SuccessResponse(204)
  async like(@Request() { user }: Koa.Request, @Path() tokenId: number, @Body() body: { liked: boolean }) {
    await this.artRepository.like(user, tokenId, body.liked);
  }
}
