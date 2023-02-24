import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '~/user';

@Entity({ name: 'firebase_integration' })
export class FirebaseIntegrationEntity {
  @PrimaryColumn()
  uid: string;

  @Column()
  email: string;

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
