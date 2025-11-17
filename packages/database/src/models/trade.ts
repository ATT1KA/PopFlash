import { randomUUID } from 'crypto';

import { Schema, model, type Model } from 'mongoose';
import type { Trade } from '@popflash/shared';

const tradeSchema = new Schema<Trade>(
  {
    _id: { type: String, default: () => randomUUID() },
    buyerUserId: { type: String, required: true, index: true },
    sellerUserId: { type: String, required: true, index: true },
    assets: [
      {
        assetId: { type: String, required: true },
        priceUsd: { type: Number, required: true },
      },
    ],
    subtotalUsd: { type: Number, required: true },
    platformFeeUsd: { type: Number, required: true },
    taxesUsd: { type: Number, required: true },
    totalUsd: { type: Number, required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true },
    status: {
      type: String,
      enum: [
        'draft',
        'awaiting_payment',
        'payment_captured',
        'assets_in_escrow',
        'settled',
        'cancelled',
        'disputed',
      ],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

tradeSchema.index({ createdAt: -1 });

export const TradeModel: Model<Trade> = model<Trade>('Trade', tradeSchema);
