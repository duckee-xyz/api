import { Recipe } from '~/art';
import { User } from '~/user';
import { assignWithoutNull } from '../../utils';
import { ReplicateModelService } from '../inference-apis';
import { GenerateTaskStatus, ServedModel } from '../types';
import { normalizeSize } from '../utils';
import { IModel } from './IModel';

export const WAIFU_DIFFUSION_METADATA: ServedModel = {
  name: 'WaifuDiffusion',
  title: 'Waifu Diffusion',
  description: 'Photo-realistic images with given any text input',
  thumbnail: 'https://placekitten.com/400/400',
  version: 'v2.1',
  recipeDefinitions: {
    availableSizes: [
      { width: 512, height: 512 },
      { width: 768, height: 768 },
    ],
    maxGuidanceScale: 20,
    promptInputOnly: false,
    defaultRuns: 50,
    defaultSampler: 'K_EULER',
    samplers: ['K_EULER'],
    defaultGuidanceScale: 7.5,
  },
};

export class WaifuDiffusion implements IModel {
  private static VER_2_1 = '25d2f75ecda0c0bed34c806b7b70319a53a1bccad3ade1a7496524f013f48983';
  private static DEFAULT_INPUTS: Partial<Recipe> = {
    runs: WAIFU_DIFFUSION_METADATA.recipeDefinitions.defaultRuns,
    sampler: WAIFU_DIFFUSION_METADATA.recipeDefinitions.defaultSampler,
    seed: Date.now(),
    guidanceScale: WAIFU_DIFFUSION_METADATA.recipeDefinitions.defaultGuidanceScale,
  };

  constructor(private replicate: ReplicateModelService) {}

  async generate(user: User, recipe: Recipe): Promise<GenerateTaskStatus> {
    const { prompt, negativePrompt, runs, size, sampler, seed, guidanceScale } = assignWithoutNull(
      WaifuDiffusion.DEFAULT_INPUTS,
      recipe,
    );

    return this.replicate.generate(WaifuDiffusion.VER_2_1, {
      prompt,
      negative_prompt: negativePrompt,
      runs,
      image_dimensions: normalizeSize(size),
      sampler,
      num_outputs: 1,
      guidance_scale: guidanceScale,
      seed,
    });
  }
}
