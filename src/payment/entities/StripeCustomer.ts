import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserEntity } from '../../user';

@Entity({ name: 'payment_stripe_customer' })
@Unique(['user'])
export class StripeCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  user: UserEntity;

  @Column()
  stripeCustomerId: string;

  @CreateDateColumn()
  createdAt: Date;
}
