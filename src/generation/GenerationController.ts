import { Body, Get, Path, Post, Request, Route, Security, Tags } from '@tsoa/runtime';
import { Service } from 'typedi';
import { Recipe } from '../art';
import { ValidationError } from '../errors';
import { AuthRequest } from '../utils';
import { GenerationRepository } from './GenerationRepository';
import { ReplicateModelService } from './inference-apis';
import { OpenAIModelService } from './inference-apis/OpenAIModelService';
import { SERVED_MODEL_METADATA } from './models';
import { GenerateTaskStatus } from './types';
import { Generate } from './usecases';

@Service()
@Tags('Generation')
@Route('/generation/v1')
export class GenerationController {
  constructor(
    private generationRepository: GenerationRepository,
    private generate: Generate,
    private openAIModelService: OpenAIModelService,
    private replicateModelService: ReplicateModelService,
  ) {}

  /**
   * @summary List Available Models for Generation
   */
  @Get('/models')
  async listModels() {
    return {
      models: SERVED_MODEL_METADATA,
    };
  }

  /**
   * @summary Generate an Image
   */
  @Post('/')
  @Security('JWT')
  async doGenerate(@Request() { user }: AuthRequest, @Body() recipe: Recipe): Promise<GenerateTaskStatus> {
    return await this.generate.generate(user, recipe);
  }

  /**
   * The client should poll this API on the generation screen
   * @summary Check Generation Progress
   */
  @Get('/:id')
  @Security('JWT')
  async getGenerationStatus(@Path() id: string): Promise<GenerateTaskStatus> {
    switch (id.split('-')[0]) {
      case 'openai':
        return await this.openAIModelService.getTaskStatus(id);
      case 'replicate':
        return await this.replicateModelService.getTaskStatus(id);
      default:
        throw new ValidationError(`invalid ID`);
    }
  }
}
