import { Service } from 'typedi';
import { Recipe } from '~/art';
import { NotFoundError, ValidationError } from '../../errors';
import { User } from '../../user';
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

    return await model.generate(user, recipe);
  }
}
