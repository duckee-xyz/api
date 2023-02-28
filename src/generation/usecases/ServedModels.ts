import { Service } from 'typedi';
import { GenerationRepository } from '../GenerationRepository';
import { DallE, IModel, StableDiffusion, WaifuDiffusion } from '../models';

@Service()
export class ServedModels {
  public models: IModel[] = [];

  constructor(
    private generationRepo: GenerationRepository,
    private dallE: DallE,
    private stableDiffusion: StableDiffusion,
    private waifuDiffusion: WaifuDiffusion,
  ) {
    this.models = [dallE, stableDiffusion, waifuDiffusion];
  }
}
