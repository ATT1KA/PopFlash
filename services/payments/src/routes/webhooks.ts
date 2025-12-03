import { Router, raw } from 'express';

import { updatePaymentStatus, findPaymentByStripeId } from '../repositories/payment-repository.js';
import { constructWebhookEvent } from '../services/stripe-service.js';

const router = Router();

router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    let event;

    try {
      event = constructWebhookEvent(req.body, signature);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', message);
      return res.status(400).json({ error: `Webhook Error: ${message}` });
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          await handlePaymentSucceeded(paymentIntent.id);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          await handlePaymentFailed(paymentIntent.id);
          break;
        }

        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object;
          await handlePaymentCancelled(paymentIntent.id);
          break;
        }

        case 'payment_intent.requires_action': {
          const paymentIntent = event.data.object;
          await handlePaymentRequiresAction(paymentIntent.id);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

const handlePaymentSucceeded = async (stripePaymentIntentId: string) => {
  const payment = await findPaymentByStripeId(stripePaymentIntentId);

  if (!payment) {
    console.warn(`Payment not found for Stripe ID: ${stripePaymentIntentId}`);
    return;
  }

  await updatePaymentStatus(stripePaymentIntentId, 'succeeded');
  console.log(`Payment ${payment._id} succeeded for trade ${payment.tradeId}`);

  // TODO: Trigger escrow flow to capture funds
  // await notifyEscrowService(payment.tradeId, 'payment_succeeded');
};

const handlePaymentFailed = async (stripePaymentIntentId: string) => {
  const payment = await findPaymentByStripeId(stripePaymentIntentId);

  if (!payment) {
    console.warn(`Payment not found for Stripe ID: ${stripePaymentIntentId}`);
    return;
  }

  await updatePaymentStatus(stripePaymentIntentId, 'failed');
  console.log(`Payment ${payment._id} failed for trade ${payment.tradeId}`);
};

const handlePaymentCancelled = async (stripePaymentIntentId: string) => {
  const payment = await findPaymentByStripeId(stripePaymentIntentId);

  if (!payment) {
    console.warn(`Payment not found for Stripe ID: ${stripePaymentIntentId}`);
    return;
  }

  await updatePaymentStatus(stripePaymentIntentId, 'cancelled');
  console.log(`Payment ${payment._id} cancelled for trade ${payment.tradeId}`);
};

const handlePaymentRequiresAction = async (stripePaymentIntentId: string) => {
  const payment = await findPaymentByStripeId(stripePaymentIntentId);

  if (!payment) {
    console.warn(`Payment not found for Stripe ID: ${stripePaymentIntentId}`);
    return;
  }

  await updatePaymentStatus(stripePaymentIntentId, 'requires_action');
  console.log(`Payment ${payment._id} requires action for trade ${payment.tradeId}`);
};

export const webhooksRouter = router;
