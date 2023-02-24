import { Get, Path, Post, Route, Security, Tags } from '@tsoa/runtime';
import { Service } from 'typedi';
import { GenerationRepository } from './GenerationRepository';
import { SERVED_MODEL_METADATA } from './models';

@Service()
@Tags('Generation')
@Route('/generation/v1')
export class GenerationController {
  constructor(private generationRepository: GenerationRepository) {}

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
  async generate() {}

  /**
   * The client should poll this API on the generation screen
   * @summary Check Generation Progress
   */
  @Get('/:id')
  @Security('JWT')
  async getGenerationStatus(@Path() id: string) {}
}
