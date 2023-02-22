import { injectable } from 'inversify';
import { cloneDeep } from 'lodash';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '~/utils';
import { UserEntity } from './entities';
import { User } from './models';

@injectable()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>) {}

  async create(creation: UserCreation): Promise<User> {
    const created = await this.userRepo.save(cloneDeep(creation));
    return created.toModel();
  }

  async findOne(where: FindOptionsWhere<UserEntity>): Promise<User | undefined> {
    const entity = await this.userRepo.findOne({
      where,
      cache: true,
    });
    return entity?.toModel();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email: ILike(email) });
  }
}

export type UserCreation = Omit<User, 'id'>;
