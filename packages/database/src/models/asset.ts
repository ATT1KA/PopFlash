import { randomUUID } from 'crypto';

import type { Asset } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type AssetEntity = Asset & { _id: string };

const assetSchema = new Schema<AssetEntity>(
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

export type AssetDocument = HydratedDocument<AssetEntity>;

export const AssetModel: Model<AssetEntity> = model<AssetEntity>('Asset', assetSchema);
