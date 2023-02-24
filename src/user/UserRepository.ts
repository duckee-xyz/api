import { cloneDeep } from 'lodash';
import { Service } from 'typedi';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '~/utils';
import { UserEntity } from './entities';
import { User } from './models';

@Service()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>) {}

  async create(creation: UserCreation): Promise<User> {
    const created = await this.userRepo.save(cloneDeep(creation));
    return Object.assign(new UserEntity(), created).toModel();
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
