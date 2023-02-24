import { Service } from 'typedi';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '~/user';
import { InjectRepository } from '~/utils';
import { FirebaseIntegrationEntity } from './entities';
import { mapFirebaseIntegrationEntityToModel } from './mappers';
import { FirebaseIntegration } from './models';

@Service()
export class FirebaseIntegrationRepository {
  constructor(
    @InjectRepository(FirebaseIntegrationEntity) private firebaseIntegrationRepo: Repository<FirebaseIntegrationEntity>,
  ) {}

  /**
   * Creates or updates {@link FirebaseIntegrationEntity}.
   *
   * @param user
   * @param uid
   * @param values
   */
  async save(user: User, uid: string, values: Partial<FirebaseIntegrationEntity>) {
    await this.firebaseIntegrationRepo.upsert({ user: { id: user.id }, uid, ...values }, ['user', 'uid']);
  }

  async getOf(user: User): Promise<FirebaseIntegration | undefined> {
    return this.get({ user: { id: user.id } });
  }

  async get(where: FindOptionsWhere<FirebaseIntegrationEntity>): Promise<FirebaseIntegration | undefined> {
    const entity = await this.firebaseIntegrationRepo.findOne({ where });
    if (!entity) {
      return;
    }
    return mapFirebaseIntegrationEntityToModel(entity);
  }

  async delete(uid: string) {
    await this.firebaseIntegrationRepo.delete({ uid });
  }
}
