import Stripe from 'stripe';

import { env } from '../config/env.js';

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const createPaymentIntent = async (params: {
  amountCents: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}) => {
  const { amountCents, currency = env.currency, customerId, metadata, description } = params;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    customer: customerId,
    metadata,
    description,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  };
};

export const cancelPaymentIntent = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
  };
};

export const createCustomer = async (params: {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}) => {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });

  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
  };
};

export const createPayout = async (params: {
  amountCents: number;
  currency?: string;
  destination: string;
  metadata?: Record<string, string>;
}) => {
  const { amountCents, currency = env.currency, destination, metadata } = params;

  const transfer = await stripe.transfers.create({
    amount: amountCents,
    currency,
    destination,
    metadata,
  });

  return {
    id: transfer.id,
    amount: transfer.amount,
    currency: transfer.currency,
    destination: transfer.destination,
  };
};

export const constructWebhookEvent = (payload: Buffer, signature: string) => {
  return stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
};
