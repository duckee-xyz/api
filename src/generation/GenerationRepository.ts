import { randomUUID } from 'crypto';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from '~/utils';
import { User } from '../user';
import { GenerationStatusEntity } from './entities';
import { GenerateTaskStatus } from './types';

@Service()
export class GenerationRepository {
  constructor(
    @InjectRepository(GenerationStatusEntity) private generationStatusRepo: Repository<GenerationStatusEntity>,
  ) {}

  async createTaskStatus(
    requestor: User,
    modelName: string,
    inferenceApiName: string,
    originalRequestId?: string,
  ): Promise<GenerateTaskStatus> {
    const status = await this.generationStatusRepo.save({
      id: randomUUID(),
      user: { id: requestor.id },
      status: 'pending',
      modelName,
      inferenceApiName,
      originalRequestId,
    });
    return Object.assign(new GenerationStatusEntity(), status).toModel();
  }

  async getTaskStatus(id: string): Promise<GenerateTaskStatus | undefined> {
    const entity = await this.generationStatusRepo.findOne({ where: { id } });
    return entity?.toModel();
  }

  async updateTaskStatus(id: string, updates: Partial<GenerateTaskStatus>) {
    await this.generationStatusRepo.update({ id }, updates);
  }
}
