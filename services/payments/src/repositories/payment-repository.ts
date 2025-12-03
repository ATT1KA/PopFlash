import { PaymentModel } from '@popflash/database';

interface CreatePaymentInput {
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: string;
}

export const createPayment = async (input: CreatePaymentInput) => {
  const payment = new PaymentModel({
    tradeId: input.tradeId,
    buyerUserId: input.buyerUserId,
    sellerUserId: input.sellerUserId,
    stripePaymentIntentId: input.stripePaymentIntentId,
    stripeCustomerId: input.stripeCustomerId,
    clientSecret: input.clientSecret,
    amountCents: input.amountCents,
    currency: input.currency,
    status: input.status,
  });

  await payment.save();
  return payment;
};

export const findPaymentByTradeId = async (tradeId: string) => {
  return PaymentModel.findOne({ tradeId }).sort({ createdAt: -1 });
};

export const findPaymentByStripeId = async (stripePaymentIntentId: string) => {
  return PaymentModel.findOne({ stripePaymentIntentId });
};

export const updatePaymentStatus = async (stripePaymentIntentId: string, status: string) => {
  return PaymentModel.findOneAndUpdate(
    { stripePaymentIntentId },
    { status, updatedAt: new Date() },
    { new: true }
  );
};

export const listPaymentsForUser = async (userId: string) => {
  return PaymentModel.find({
    $or: [{ buyerUserId: userId }, { sellerUserId: userId }],
  }).sort({ createdAt: -1 });
};
