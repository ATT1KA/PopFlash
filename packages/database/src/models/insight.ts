import { randomUUID } from 'crypto';

import type { Insight } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type InsightEntity = Insight & { _id: string };

const insightSchema = new Schema<InsightEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, default: null, index: true },
    assetId: { type: String, default: null, index: true },
    tradeId: { type: String, default: null, index: true },
    headline: { type: String, required: true },
    detail: { type: String, required: true },
    narrative: { type: String, required: true },
    sentiment: { type: String, enum: ['bullish', 'neutral', 'bearish'], required: true },
    impact: {
      type: String,
      enum: ['portfolio', 'operations', 'risk'],
      required: true,
      index: true,
    },
    confidence: { type: Number, min: 0, max: 1, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active', index: true },
    recommendedActions: { type: [String], default: [] },
    supportingMetrics: {
      type: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
          delta: { type: String, required: false },
        },
      ],
      default: [],
    },
    tags: { type: [String], default: [], index: true },
    channels: {
      type: [String],
      enum: ['push', 'email', 'in_app', 'webhook'],
      default: ['in_app'],
    },
    references: {
      type: [
        {
          type: {
            type: String,
            enum: ['trade', 'asset', 'portfolio', 'counterparty', 'compliance'],
            default: 'portfolio',
          },
          id: { type: String, required: false },
        },
      ],
      default: [],
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    generatedAt: { type: Date, required: true, index: true },
    updatedAt: { type: Date, required: true },
    expiresAt: { type: Date, default: null, index: true },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

insightSchema.index({
  userId: 1,
  status: 1,
  generatedAt: -1,
});
insightSchema.index({ tags: 1 });

export type InsightDocument = HydratedDocument<InsightEntity>;

export const InsightModel: Model<InsightEntity> = model<InsightEntity>('Insight', insightSchema);
