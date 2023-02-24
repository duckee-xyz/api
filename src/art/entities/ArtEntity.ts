import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../user';
import { Recipe } from '../models';

@Entity({ name: 'art' })
export class ArtEntity {
  @PrimaryGeneratedColumn()
  tokenId: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => UserEntity, { eager: true })
  owner: UserEntity;

  @Column('double precision')
  priceInFlow: number;

  @Column('double precision')
  royaltyFee: number;

  @Column('simple-json')
  recipe: Recipe;

  @Column()
  parentTokenId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
