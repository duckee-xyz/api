import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { GenerateTaskStatus } from '../types';

@Entity({ name: 'generation_openai_status' })
export class OpenAIGenerationStatus {
  @PrimaryColumn()
  id: string;

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
