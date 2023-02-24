import { CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../user';
import { ArtEntity } from './ArtEntity';

@Entity({ name: 'art_like' })
export class ArtLike {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ArtEntity, { cascade: true })
  @JoinColumn()
  art: ArtEntity;

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  at: Date;
}
