import { ConfigKey } from '../utils';

export class PaymentConfig {
  @ConfigKey({ env: 'PAYMENT_STRIPE_PUBLISH_KEY', warnIfNotGiven: true })
  stripePublishKey: string;

  @ConfigKey({ env: 'PAYMENT_STRIPE_SECRET_KEY', warnIfNotGiven: true })
  stripeSecretKey: string;

  @ConfigKey({ env: 'PAYMENT_STRIPE_WEBHOOK_ENDPOINT_SECRET' })
  stripeWebhookEndpointSecret?: string;
}
