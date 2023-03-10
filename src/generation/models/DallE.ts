import { Service } from 'typedi';
import { Recipe } from '../../art';
import { User } from '../../user';
import { OpenAIModelService } from '../inference-apis/OpenAIModelService';
import { ServedModel } from '../types';
import { IModel } from './IModel';

export const DALLE_METADATA: ServedModel = {
  name: 'DallE',
  title: 'DALL-E',
  description: 'Realistic images and art from simple prompt, brought to you by OpenAI.',
  thumbnail: 'https://static.duckee.xyz/model-preview/dalle.png',
  version: 'v2.0',
  recipeDefinitions: {
    availableSizes: [
      { width: 512, height: 512 },
      { width: 1024, height: 1024 },
    ],
    promptInputOnly: true,

    // below is not used since promptInputOnly = true
    maxGuidanceScale: 0,
    defaultRuns: 0,
    defaultSampler: '',
    samplers: [],
    defaultGuidanceScale: 0,
  },
};

@Service()
export class DallE implements IModel {
  constructor(private openAI: OpenAIModelService) {}

  async generate(user: User, recipe: Recipe): Promise<string> {
    return this.openAI.generate('<not-required>', { prompt: recipe.prompt });
  }
}
