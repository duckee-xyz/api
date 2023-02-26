import {
  Body,
  File,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from '@tsoa/runtime';
import { randomUUID } from 'crypto';
import Koa from 'koa';
import { extname } from 'path';
import { Service } from 'typedi';
import { PaginatedResult, uploadToS3 } from '~/utils';
import { ArtRepository } from './ArtRepository';
import { Art, ArtCreation } from './models';
import { CreateArtNFT } from './usecases';

export type ArtCreationRequest = Omit<ArtCreation, 'owner'>;

@Service()
@Tags('Art')
@Route('/art/v1')
export class ArtController {
  constructor(private artRepository: ArtRepository, private createArtNFT: CreateArtNFT) {}

  /**
   * @summary Upload & Mint Art NFT
   */
  @Post('/')
  @Security('JWT')
  @SuccessResponse(201)
  async create(@Request() { user }: Koa.Request, @Body() creation: ArtCreationRequest) {
    const artDetails = await this.createArtNFT.call(user, creation);
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
   * @summary Upload Image (Used in Import)
   */
  @Post('/image')
  async uploadImage(@Request() request: Koa.Request) {
    const files = request.files as File[];
    const file = files.find(({ fieldname }) => fieldname === 'file');
    if (!file) {
      throw new Error('file not found. please image to form field named "file"');
    }
    const newFilename = `${randomUUID()}${extname(file.originalname)}`;

    const uploader = await uploadToS3(`/images/${newFilename}`);
    uploader.stream.end(file.buffer);
    await uploader.done;

    return { url: uploader.url };
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
