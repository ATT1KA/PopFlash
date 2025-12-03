import { createPayment, findPaymentByTradeId, updatePaymentStatus } from '../repositories/payment-repository.js';
import { HttpError } from '../utils/http-error.js';

import { createPaymentIntent, retrievePaymentIntent, cancelPaymentIntent } from './stripe-service.js';

export const initiatePaymentForTrade = async (params: {
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  amountUsd: number;
  stripeCustomerId?: string;
}) => {
  const { tradeId, buyerUserId, sellerUserId, amountUsd, stripeCustomerId } = params;

  const existing = await findPaymentByTradeId(tradeId);

  if (existing && existing.status !== 'failed' && existing.status !== 'cancelled') {
    return {
      id: existing._id.toString(),
      tradeId: existing.tradeId,
      stripePaymentIntentId: existing.stripePaymentIntentId,
      clientSecret: existing.clientSecret,
      status: existing.status,
      amountCents: existing.amountCents,
    };
  }

  const amountCents = Math.round(amountUsd * 100);

  const paymentIntent = await createPaymentIntent({
    amountCents,
    customerId: stripeCustomerId,
    metadata: {
      tradeId,
      buyerUserId,
      sellerUserId,
    },
    description: `PopFlash trade ${tradeId}`,
  });

  const payment = await createPayment({
    tradeId,
    buyerUserId,
    sellerUserId,
    stripePaymentIntentId: paymentIntent.id,
    stripeCustomerId,
    clientSecret: paymentIntent.clientSecret!,
    amountCents,
    currency: paymentIntent.currency,
    status: 'pending',
  });

  return {
    id: payment._id.toString(),
    tradeId: payment.tradeId,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    clientSecret: payment.clientSecret,
    status: payment.status,
    amountCents: payment.amountCents,
  };
};

export const getPaymentStatus = async (tradeId: string) => {
  const payment = await findPaymentByTradeId(tradeId);

  if (!payment) {
    throw new HttpError(404, `Payment not found for trade ${tradeId}`);
  }

  const stripeStatus = await retrievePaymentIntent(payment.stripePaymentIntentId);

  if (stripeStatus.status !== payment.status) {
    await updatePaymentStatus(payment.stripePaymentIntentId, mapStripeStatus(stripeStatus.status));
  }

  return {
    id: payment._id.toString(),
    tradeId: payment.tradeId,
    status: mapStripeStatus(stripeStatus.status),
    amountCents: payment.amountCents,
    currency: payment.currency,
  };
};

export const cancelPayment = async (tradeId: string) => {
  const payment = await findPaymentByTradeId(tradeId);

  if (!payment) {
    throw new HttpError(404, `Payment not found for trade ${tradeId}`);
  }

  if (payment.status === 'succeeded') {
    throw new HttpError(400, 'Cannot cancel a succeeded payment');
  }

  await cancelPaymentIntent(payment.stripePaymentIntentId);
  await updatePaymentStatus(payment.stripePaymentIntentId, 'cancelled');

  return {
    id: payment._id.toString(),
    tradeId: payment.tradeId,
    status: 'cancelled',
  };
};

const mapStripeStatus = (stripeStatus: string): string => {
  const statusMap: Record<string, string> = {
    requires_payment_method: 'pending',
    requires_confirmation: 'pending',
    requires_action: 'requires_action',
    processing: 'processing',
    requires_capture: 'requires_capture',
    canceled: 'cancelled',
    succeeded: 'succeeded',
  };

  return statusMap[stripeStatus] ?? 'pending';
};
