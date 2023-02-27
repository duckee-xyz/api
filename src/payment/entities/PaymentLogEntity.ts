import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArtEntity } from '../../art';
import { PaymentLog } from '../models';

@Entity({ name: 'payment_log' })
export class PaymentLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @ManyToOne(() => ArtEntity, { cascade: true })
  @JoinColumn({ name: 'artTokenId' })
  art: ArtEntity;

  @Column()
  artTokenId: number;

  @Column()
  paymentIntentId: string;

  @Column('double precision')
  amountInUsd: number;

  @Column()
  status: 'pending' | 'succeed' | 'failed' | 'canceled';

  @Column({ nullable: true })
  txId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toModel(): PaymentLog {
    return {
      address: this.address,
      artTokenId: this.artTokenId,
      paymentIntentId: this.paymentIntentId,
      amountInUsd: this.amountInUsd,
      status: this.status,
      txId: this.txId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
