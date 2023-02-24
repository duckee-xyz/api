import { Service } from 'typedi';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '~/user';
import { InjectRepository } from '~/utils';
import { GoogleIntegrationEntity } from './entities';
import { mapGoogleIntegrationEntityToModel } from './mappers';
import { GoogleIntegration } from './models';

@Service()
export class GoogleIntegrationRepository {
  constructor(
    @InjectRepository(GoogleIntegrationEntity)
    private googleIntegrationRepo: Repository<GoogleIntegrationEntity>,
  ) {}

  /**
   * Creates or updates {@link GoogleIntegration}.
   *
   * @param user
   * @param email
   * @param values
   */
  async save(user: User, email: string, values: Partial<GoogleIntegrationEntity>) {
    await this.googleIntegrationRepo.upsert({ user: { id: user.id }, email, ...values }, ['user', 'email']);
  }

  async listOf(user: User): Promise<GoogleIntegration[]> {
    const integrations = await this.googleIntegrationRepo.find({
      where: { user: { id: user.id } },
    });
    return integrations.map(mapGoogleIntegrationEntityToModel);
  }

  async get(where: FindOptionsWhere<GoogleIntegrationEntity>): Promise<GoogleIntegration | undefined> {
    const entity = await this.googleIntegrationRepo.findOne({ where });
    if (!entity) {
      return;
    }
    return mapGoogleIntegrationEntityToModel(entity);
  }

  async delete(id: number) {
    await this.googleIntegrationRepo.delete({ id });
  }
}
