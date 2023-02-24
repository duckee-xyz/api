import { cloneDeep } from 'lodash';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { InjectRepository } from '~/utils';
import { NotFoundError } from '../errors';
import { UserEntity } from './entities';
import { User, UserDetails } from './models';
import { getRequestUser } from './utils';

@Service()
export class UserRepository {
  constructor(@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>) {}

  async mapEntityToModel(entity: UserEntity): Promise<User> {
    const requestor = getRequestUser();
    const following = requestor ? await this.isFollowing(requestor, entity.id) : undefined;

    return {
      id: entity.id,
      address: entity.address,
      email: entity.email,
      following,
      profileImage: entity.profileImage,
    };
  }

  async create(creation: UserCreation): Promise<User> {
    const created = await this.userRepo.save(cloneDeep(creation));
    return this.mapEntityToModel(created);
  }

  async findOne(where: FindOptionsWhere<UserEntity>): Promise<User | undefined> {
    const entity = await this.userRepo.findOne({
      where,
      cache: true,
    });
    if (!entity) {
      return;
    }
    return this.mapEntityToModel(entity);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email: ILike(email) });
  }

  async details(id: number): Promise<UserDetails> {
    const user = await this.findOne({ id });
    if (!user) {
      throw new NotFoundError(`user ${id} not found`);
    }
    const followingCount = await this.userRepo
      .createQueryBuilder('user')
      .select('COUNT(*) AS followingCount')
      .innerJoin('user_follow', 'follow', 'follow.from = user.id')
      .where('user.id = :id', { id })
      .getRawOne()
      .then((it) => Number(it.followingCount)); // exclude self

    const followerCount = await this.userRepo
      .createQueryBuilder('user')
      .select('COUNT(*) AS followerCount')
      .innerJoin('user_follow', 'follow', 'follow.to = user.id')
      .where('user.id = :id', { id })
      .getRawOne()
      .then((it) => Number(it.followerCount));

    return {
      ...user,
      followingCount,
      followerCount,
      artCount: 0,
    };
  }

  async follow(user: User, targetUserId: number) {
    const [userEntity, targetUserEntity] = await Promise.all([
      this.userRepo.findOneOrFail({ where: { id: user.id }, relations: { followings: true } }),
      this.userRepo.findOneByOrFail({ id: targetUserId }),
    ]);
    if (userEntity.followings.find((it) => it.id === targetUserId)) {
      log.trace('already following', { from: user.id, to: targetUserId });
      return;
    }
    userEntity.followings.push(targetUserEntity);
    await this.userRepo.save(userEntity);
  }

  private async isFollowing(me: User, otherUserId: number) {
    if (me.id === otherUserId) {
      return false;
    }
    return this.userRepo
      .createQueryBuilder('user')
      .select('COUNT(*) AS following')
      .innerJoin('user_follow', 'follow', 'follow.from = user.id')
      .where('user.id = :myId AND follow.to = :otherUserId', { myId: me.id, otherUserId })
      .getRawOne()
      .then((it) => it?.following > 0);
  }

  async unfollow(user: User, targetUserId: number) {
    const userEntity = await this.userRepo.findOneOrFail({ where: { id: user.id }, relations: { followings: true } });
    userEntity.followings = userEntity.followings.filter((it) => it.id !== targetUserId);
    await this.userRepo.save(userEntity);
  }
}

export type UserCreation = Omit<User, 'id' | 'following'>;
