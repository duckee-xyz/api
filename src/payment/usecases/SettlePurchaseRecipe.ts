import { log } from 'pine-log';
import Stripe from 'stripe';
import { Service } from 'typedi';
import { PaymentConfig } from '../PaymentConfig';
import { PaymentRepository } from '../PaymentRepository';

@Service()
export class SettlePurchaseRecipe {
  private stripe: Stripe;

  constructor(private config: PaymentConfig, private paymentRepository: PaymentRepository) {
    this.stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });
  }

  async call(event: Stripe.Event) {
    if (!event.type.startsWith('payment_intent.')) {
      log.trace(`Unhandled event type found`, { type: event.type, event });
      return;
    }
    const state = event.type.replace('payment_intent.', '');
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // logged on RequestPurchaseRecipe
    const paymentLog = await this.paymentRepository.getPaymentLogBy(paymentIntent.id);
    if (!paymentLog) {
      log.warn('paymentIntent unmatch: unable to find payment log', { paymentIntentId: paymentIntent.id, event });
      return;
    }
    const { artTokenId, address, amountInUsd, createdAt } = paymentLog;

    switch (state) {
      case 'succeed':
        log.info('payment succeed', { artTokenId, address, amountInUsd, at: createdAt.toISOString() });
        await this.paymentRepository.updatePaymentLog(paymentIntent.id, { status: 'succeed' });
        // TODO: art token
        return;

      case 'canceled':
        log.info('payment canceled', {
          reason: paymentIntent.cancellation_reason,
          artTokenId,
          address,
          amountInUsd,
          at: createdAt.toISOString(),
        });
        await this.paymentRepository.updatePaymentLog(paymentIntent.id, { status: 'canceled' });
        return;

      case 'payment_failed':
        log.info('payment failed', {
          reason: paymentIntent.last_payment_error,
          artTokenId,
          address,
          amountInUsd,
          at: createdAt.toISOString(),
        });
        await this.paymentRepository.updatePaymentLog(paymentIntent.id, { status: 'failed' });
        return;

      default:
        log.trace(`Unhandled event type found`, { type: event.type, event });
        return;
    }
  }
}
