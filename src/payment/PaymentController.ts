import { Path, Post, Request, Route, Security, SuccessResponse, Tags } from '@tsoa/runtime';
import Koa from 'koa';
import { log } from 'pine-log';
import Stripe from 'stripe';
import { Service } from 'typedi';
import { ArtRepository } from '../art';
import { NotFoundError, ValidationError } from '../errors';
import { PaymentConfig } from './PaymentConfig';
import { PaymentRepository } from './PaymentRepository';
import { RequestPurchaseRecipe, StripePaymentSheet } from './usecases';
import { SettlePurchaseRecipe } from './usecases/SettlePurchaseRecipe';

@Service()
@Tags('Payment')
@Route('/payment/v1')
export class PaymentController {
  private stripe: Stripe;

  constructor(
    private config: PaymentConfig,
    private paymentRepository: PaymentRepository,
    private artRepository: ArtRepository,
    private requestPurchaseRecipe: RequestPurchaseRecipe,
    private settlePurchaseRecipe: SettlePurchaseRecipe,
  ) {
    this.stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });
  }

  /**
   * Creates Stripe PaymentIntent for purchasing a recipe SBT of art NFT.
   * @summary Create Stripe Payment to Purchase Recipe
   */
  @Post('/art/:artId/recipe')
  @Security('JWT')
  async createRecipePayment(@Request() { user }: Koa.Request, @Path() artId: number): Promise<StripePaymentSheet> {
    const art = await this.artRepository.get(artId);
    if (!art) {
      throw new NotFoundError('art not found', { artId });
    }
    return await this.requestPurchaseRecipe.call(user, art);
  }

  /**
   * An webhook handles Stripe Event. Should be registered in Stripe Dashboard.
   * It settles users' recipe payment request, and mints a prompt SBT of the art NFT if it succeed.
   *
   * @see {@link https://stripe.com/docs/webhooks/quickstart}
   * @summary Stripe Webhook
   */
  @Post('/webhook/stripe')
  @SuccessResponse(200)
  async webhook(@Request() request: Koa.Request) {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (this.config.stripeWebhookEndpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers['stripe-signature'];
      if (!signature) {
        throw new ValidationError(`stripe-signature header is missing`);
      }
      try {
        event = this.stripe.webhooks.constructEvent(request.body, signature, this.config.stripeWebhookEndpointSecret);
      } catch (err) {
        log.error(`Stripe Webhook signature verification failed`, err as Error);
        throw new ValidationError((err as Error).message);
      }
    }
    await this.settlePurchaseRecipe.call(event);
  }
}
