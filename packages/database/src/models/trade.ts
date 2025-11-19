import { randomUUID } from 'crypto';

import type { Trade } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type TradeEntity = Trade & { _id: string };

const tradeSchema = new Schema<TradeEntity>(
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
        'under_review',
        'payment_captured',
        'settlement_pending',
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

export type TradeDocument = HydratedDocument<TradeEntity>;

export const TradeModel: Model<TradeEntity> = model<TradeEntity>('Trade', tradeSchema);
