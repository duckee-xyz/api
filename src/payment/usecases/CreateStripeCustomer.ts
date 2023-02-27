import { log } from 'pine-log';
import Stripe from 'stripe';
import { Service } from 'typedi';
import { User } from '../../user';
import { PaymentConfig } from '../PaymentConfig';
import { PaymentRepository } from '../PaymentRepository';

@Service()
export class CreateStripeCustomer {
  private stripe: Stripe;

  constructor(private config: PaymentConfig, private paymentRepository: PaymentRepository) {
    this.stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });
  }

  async call(user: User): Promise<string> {
    const customer = await this.stripe.customers.create({ email: user.email });
    log.info('created stripe customer for user', { userId: user.id, customer });
    await this.paymentRepository.setStripeCustomerId(user, customer.id);
    return customer.id;
  }
}
