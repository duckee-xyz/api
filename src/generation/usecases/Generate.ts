import axios from 'axios';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { Recipe } from '~/art';
import { NotFoundError, ValidationError } from '../../errors';
import { User } from '../../user';
import { uploadToS3 } from '../../utils';
import { GenerationRepository } from '../GenerationRepository';
import { DallE, IModel, StableDiffusion, WaifuDiffusion } from '../models';
import { GenerateTaskStatus } from '../types';

@Service()
export class Generate {
  private models: IModel[] = [];

  constructor(
    private generationRepo: GenerationRepository,
    private dallE: DallE,
    private stableDiffusion: StableDiffusion,
    private waifuDiffusion: WaifuDiffusion,
  ) {
    this.models = [dallE, stableDiffusion, waifuDiffusion];
  }

  async generate(user: User, recipe: Recipe): Promise<GenerateTaskStatus> {
    if (!recipe.model.servedModelName) {
      throw new ValidationError('cannot generate with imported models');
    }
    const model = this.models.find((it) => it.constructor.name === recipe.model.servedModelName);
    if (!model) {
      throw new NotFoundError(`model ${recipe.model.servedModelName} not found`);
    }

    const status = await this.generationRepo.createTaskStatus(
      user,
      recipe.model.servedModelName,
      recipe.model.servedModelName === 'DallE' ? 'openai' : 'replicate',
    );
    this.generateInBackground(user, model, recipe, status);
    return status;
  }

  private async generateInBackground(user: User, model: IModel, recipe: Recipe, status: GenerateTaskStatus) {
    try {
      const resultImageInOrigin = await model.generate(user, recipe);

      log.trace('image generation completed', { model: status.modelName, id: status.id, resultImageInOrigin });

      const uploadImageToS3 = await uploadToS3(`/images/${status.id}.png`);
      const downloadImageFromOrigin = await axios({
        method: 'GET',
        url: resultImageInOrigin,
        responseType: 'stream',
      });
      downloadImageFromOrigin.data.pipe(uploadImageToS3.stream);
      await uploadImageToS3.done;

      await this.generationRepo.updateTaskStatus(status.id, {
        status: 'completed',
        resultImageUrl: uploadImageToS3.url,
      });
    } catch (err) {
      const error = err as Error;
      log.error('failed to generate image', error, { model: status.modelName, id: status.id });
      await this.generationRepo.updateTaskStatus(status.id, { status: 'failed', error: error.stack ?? error.message });
    }
  }
}
