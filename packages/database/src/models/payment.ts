import mongoose, { Document, Schema } from 'mongoose';

export interface PaymentDocument extends Document {
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    tradeId: {
      type: String,
      required: true,
      index: true,
    },
    buyerUserId: {
      type: String,
      required: true,
      index: true,
    },
    sellerUserId: {
      type: String,
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    amountCents: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'requires_action',
        'requires_capture',
        'processing',
        'succeeded',
        'failed',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ buyerUserId: 1, createdAt: -1 });
PaymentSchema.index({ sellerUserId: 1, createdAt: -1 });

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);
