import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../user';
import { GenerateTaskStatus } from '../types';

@Entity({ name: 'generation_status' })
export class GenerationStatusEntity {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => UserEntity, { cascade: true })
  user: UserEntity;

  @Column()
  modelName: string;

  @Column()
  inferenceApiName: string;

  @Column({ nullable: true })
  originalRequestId?: string;

  @Column()
  status: 'pending' | 'completed' | 'failed';

  @Column({ type: 'text', nullable: true })
  resultImageUrl: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toModel(): GenerateTaskStatus {
    return this;
  }
}
