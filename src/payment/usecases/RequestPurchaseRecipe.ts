import { log } from 'pine-log';
import Stripe from 'stripe';
import { Service } from 'typedi';
import { Art } from '../../art';
import { User } from '../../user';
import { PaymentConfig } from '../PaymentConfig';
import { PaymentRepository } from '../PaymentRepository';
import { CreateStripeCustomer } from './CreateStripeCustomer';

export interface StripePaymentSheet {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
}

@Service()
export class RequestPurchaseRecipe {
  private stripe: Stripe;

  constructor(
    private config: PaymentConfig,
    private paymentRepository: PaymentRepository,
    private createStripeCustomer: CreateStripeCustomer,
  ) {
    this.stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });
  }

  async call(user: User, art: Art): Promise<StripePaymentSheet> {
    const customer = await this.createOrGetStripeCustomerId(user);

    const ephemeralKey = await this.stripe.ephemeralKeys.create({ customer }, { apiVersion: '2022-11-15' });
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: art.priceInFlow,
      currency: 'usd',
      customer,
      automatic_payment_methods: { enabled: true },
    });
    log.trace('created payment intent', { paymentIntent });

    await this.paymentRepository.createPaymentLog({
      status: 'pending',
      address: user.address,
      artTokenId: art.tokenId,
      paymentIntentId: paymentIntent.id,
      amountInUsd: paymentIntent.amount,
    });

    return {
      paymentIntent: paymentIntent.client_secret!,
      ephemeralKey: ephemeralKey.secret!,
      customer,
      publishableKey: this.config.stripePublishKey,
    };
  }

  private async createOrGetStripeCustomerId(user: User): Promise<string> {
    const customerId = await this.paymentRepository.getStripeCustomerId(user);
    if (!customerId) {
      return await this.createStripeCustomer.call(user);
    }
    return customerId;
  }
}
