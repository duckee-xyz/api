import { Configuration, OpenAIApi } from 'openai';
import { Service } from 'typedi';
import { GenerationConfig } from '../GenerationConfig';
import { IModelService } from './IModelService';

@Service()
export class OpenAIModelService implements IModelService {
  private openAI: OpenAIApi;

  constructor(private config: GenerationConfig) {
    this.openAI = new OpenAIApi(new Configuration({ apiKey: config.openAIApiKey }));
  }

  async generate(model: string, input: any): Promise<string> {
    const { data } = await this.openAI.createImage({
      prompt: input.prompt,
      size: '512x512',
      response_format: 'url',
      n: 1,
    });

    return data.data[0].url!;
  }
}
