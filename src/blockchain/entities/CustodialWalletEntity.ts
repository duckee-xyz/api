import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Wallet } from '../wallets';

/**
 * FIXME: This is insecure. replace it into AWS KMS or higher-level security storage after Flow Hackathon
 */
@Entity({ name: 'wallet' })
@Unique(['address'])
export class CustodialWalletEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column('simple-json')
  wallet: Wallet;

  @CreateDateColumn()
  createdAt: Date;
}
