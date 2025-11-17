import { randomUUID } from 'crypto';

import { Schema, model, type Model } from 'mongoose';

import type { Asset } from '@popflash/shared';

const assetSchema = new Schema<Asset>(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    description: { type: String },
    steamMarketHashName: { type: String, required: true, index: true },
    iconUrl: { type: String },
    rarity: {
      type: String,
      enum: [
        'consumer',
        'industrial',
        'mil-spec',
        'restricted',
        'classified',
        'covert',
        'contraband',
        'legendary',
      ],
      required: true,
    },
    suggestedPriceUsd: { type: Number, required: true },
    suggestedPriceUpdatedAt: { type: Date, required: true },
    ownerUserId: { type: String, index: true, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

assetSchema.index({ name: 'text', description: 'text' });

export const AssetModel: Model<Asset> = model<Asset>('Asset', assetSchema);
