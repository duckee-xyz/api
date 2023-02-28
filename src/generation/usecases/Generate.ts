import { Service } from 'typedi';
import { Recipe } from '~/art';
import { NotFoundError, ValidationError } from '../../errors';
import { User } from '../../user';
import { GenerationRepository } from '../GenerationRepository';
import { DallE } from '../models';
import { GenerateTaskStatus } from '../types';
import { GenerateInBackground } from './GenerateInBackground';
import { ServedModels } from './ServedModels';

@Service()
export class Generate {
  constructor(
    private generationRepo: GenerationRepository,
    private servedModels: ServedModels,
    private generateInBackground: GenerateInBackground,
  ) {}

  async generate(user: User, recipe: Recipe): Promise<GenerateTaskStatus> {
    if (!recipe.model.servedModelName) {
      throw new ValidationError('cannot generate with imported models');
    }
    const model = this.servedModels.models.find((it) => it.constructor.name === recipe.model.servedModelName);
    if (!model) {
      throw new NotFoundError(`model ${recipe.model.servedModelName} not found`);
    }

    const status = await this.generationRepo.createTaskStatus(
      user,
      recipe.model.servedModelName,
      recipe.model.servedModelName === 'DallE' ? 'openai' : 'replicate',
    );
    if (process.env.SERVERLESS) {
    }
    await this.generateInBackground.call(user, model, recipe, status);
    return status;
  }
}
