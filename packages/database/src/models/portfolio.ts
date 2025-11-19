import { randomUUID } from 'crypto';

import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface PortfolioHolding {
  assetId: string;
  quantity: number;
  valueUsd: number;
}

export interface PortfolioDocument {
  id: string;
  userId: string;
  totalValueUsd: number;
  holdings: PortfolioHolding[];
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const holdingSchema = new Schema<PortfolioHolding>(
  {
    assetId: { type: String, required: true },
    quantity: { type: Number, required: true },
    valueUsd: { type: Number, required: true },
  },
  { _id: false },
);

type PortfolioEntity = PortfolioDocument & { _id: string };

const portfolioSchema = new Schema<PortfolioEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true, unique: true, index: true },
    totalValueUsd: { type: Number, required: true, default: 0 },
    holdings: { type: [holdingSchema], default: [] },
    lastSyncedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type PortfolioMongoDocument = HydratedDocument<PortfolioEntity>;

export const PortfolioModel: Model<PortfolioEntity> = model<PortfolioEntity>(
  'Portfolio',
  portfolioSchema,
);
