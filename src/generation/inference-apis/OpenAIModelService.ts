import { randomUUID } from 'crypto';
import { Configuration, OpenAIApi } from 'openai';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from '../../utils';
import { OpenAIGenerationStatus } from '../entities';
import { GenerationConfig } from '../GenerationConfig';
import { GenerateTaskStatus } from '../types';
import { IModelService } from './IModelService';

@Service()
export class OpenAIModelService implements IModelService {
  private openAI: OpenAIApi;
  private ongoingTasks: GenerateTaskStatus[] = [];

  constructor(
    private config: GenerationConfig,
    @InjectRepository(OpenAIGenerationStatus) private generationStatusRepository: Repository<OpenAIGenerationStatus>,
  ) {
    this.openAI = new OpenAIApi(new Configuration({ apiKey: config.openAIApiKey }));
  }

  async generate(model: string, input: any): Promise<GenerateTaskStatus> {
    const taskStatus = await this.generationStatusRepository.save({
      id: randomUUID(),
      status: 'pending',
    });

    this.openAI
      .createImage({
        prompt: input.prompt,
        size: '512x512',
        response_format: 'url',
        n: 1,
      })
      .then(({ data }) => {
        return this.generationStatusRepository.update(
          { id: taskStatus.id },
          {
            status: 'completed',
            resultImageUrl: data.data[0].url,
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

    this.ongoingTasks.push(taskStatus);
    return taskStatus;
  }

  async getTaskStatus(id: string): Promise<GenerateTaskStatus> {
    return this.generationStatusRepository.findOneByOrFail({ id }).then((it) => it.toModel());
  }

  async cancelTask(id: string): Promise<void> {}
}
