import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '~/user';

@Entity('integration_google')
@Unique(['user', 'email'])
export class GoogleIntegrationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true })
  user: UserEntity;

  @Column()
  email: string;

  @Column({ default: false })
  isLoginChannel: boolean;

  @Column('text')
  accessToken: string;

  @Column('text')
  refreshToken: string;

  @Column()
  scope: string;

  @Column()
  expiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
