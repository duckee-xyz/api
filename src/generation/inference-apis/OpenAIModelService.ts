import axios from 'axios';
import { randomUUID } from 'crypto';
import { Configuration, OpenAIApi } from 'openai';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository, uploadToS3 } from '../../utils';
import { OpenAIGenerationStatus } from '../entities';
import { GenerationConfig } from '../GenerationConfig';
import { GenerateTaskStatus } from '../types';
import { IModelService } from './IModelService';

@Service()
export class OpenAIModelService implements IModelService {
  private openAI: OpenAIApi;

  constructor(
    private config: GenerationConfig,
    @InjectRepository(OpenAIGenerationStatus) private generationStatusRepository: Repository<OpenAIGenerationStatus>,
  ) {
    this.openAI = new OpenAIApi(new Configuration({ apiKey: config.openAIApiKey }));
  }

  async generate(model: string, input: any): Promise<GenerateTaskStatus> {
    const taskStatus = await this.generationStatusRepository.save({
      id: `openai-${randomUUID()}`,
      status: 'pending',
    });

    this.openAI
      .createImage({
        prompt: input.prompt,
        size: '512x512',
        response_format: 'url',
        n: 1,
      })
      .then(async ({ data }) => {
        const resultUrl = data.data[0].url;
        log.trace('OpenAI image generation completed', { id: taskStatus.id, resultUrl });

        const uploadImageToS3 = await uploadToS3(`/images/${taskStatus.id}.png`);

        const downloadImageFromOpenAI = await axios({
          method: 'GET',
          url: resultUrl,
          responseType: 'stream',
        });
        downloadImageFromOpenAI.data.pipe(uploadImageToS3.stream);
        await uploadImageToS3.done;

        return this.generationStatusRepository.update(
          { id: taskStatus.id },
          {
            status: 'completed',
            resultImageUrl: uploadImageToS3.url,
          },
        );
      })
      .catch((err) => {
        return this.generationStatusRepository.update(
          { id: taskStatus.id },
          {
            status: 'failed',
            error: err.stack,
          },
        );
      });

    return taskStatus;
  }

  async getTaskStatus(id: string): Promise<GenerateTaskStatus> {
    return this.generationStatusRepository.findOneByOrFail({ id }).then((it) => it.toModel());
  }

  async cancelTask(id: string): Promise<void> {}
}
