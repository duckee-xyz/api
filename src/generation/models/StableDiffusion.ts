import { Service } from 'typedi';
import { Recipe } from '~/art';
import { User } from '~/user';
import { assignWithoutNull } from '../../utils';
import { ReplicateModelService } from '../inference-apis';
import { GenerateTaskStatus, ServedModel } from '../types';
import { normalizeSize } from '../utils';
import { IModel } from './IModel';

export const STABLE_DIFFUSION_METADATA: ServedModel = {
  name: 'StableDiffusion',
  title: 'Stable Diffusion',
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
    defaultRuns: 20,
    defaultSampler: 'K_EULER',
    samplers: ['K_EULER'],
    defaultGuidanceScale: 7.5,
  },
};

@Service()
export class StableDiffusion implements IModel {
  private static VER_2_1 = 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf';
  private static DEFAULT_INPUTS: Partial<Recipe> = {
    runs: STABLE_DIFFUSION_METADATA.recipeDefinitions.defaultRuns,
    sampler: STABLE_DIFFUSION_METADATA.recipeDefinitions.defaultSampler,
    seed: Date.now(),
    guidanceScale: STABLE_DIFFUSION_METADATA.recipeDefinitions.defaultGuidanceScale,
  };

  constructor(private replicate: ReplicateModelService) {}

  async generate(user: User, recipe: Recipe): Promise<GenerateTaskStatus> {
    const { prompt, negativePrompt, runs, size, sampler, seed, guidanceScale } = assignWithoutNull(
      StableDiffusion.DEFAULT_INPUTS,
      recipe,
    );

    return this.replicate.generate(StableDiffusion.VER_2_1, {
      prompt,
      negative_prompt: negativePrompt,
      runs,
      image_dimensions: normalizeSize(size, ['512x512', '768x768']),
      sampler,
      num_outputs: 1,
      guidance_scale: guidanceScale,
      seed,
    });
  }
}
