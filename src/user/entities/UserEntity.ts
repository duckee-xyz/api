import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../models';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  nickname: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  profileImage?: string;

  @ManyToMany((type) => UserEntity, (user) => user.followings, { cascade: true })
  @JoinTable({ name: 'user_follow', joinColumn: { name: 'to' }, inverseJoinColumn: { name: 'from' } })
  followers: UserEntity[];

  @ManyToMany((type) => UserEntity, (user) => user.followers)
  followings: UserEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toModel(): User {
    return {
      id: this.id,
      nickname: this.nickname,
      address: this.address,
      email: this.email,
      profileImage: this.profileImage,
    };
  }
}
