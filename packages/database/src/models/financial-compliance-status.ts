import { randomUUID } from 'crypto';

import type { FinancialComplianceStatus } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type FinancialComplianceStatusEntity = FinancialComplianceStatus & { _id: string };

const financialComplianceStatusSchema = new Schema<FinancialComplianceStatusEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    platform: {
      type: String,
      enum: ['ios_app_store', 'android_play_store', 'payment_processor', 'regulatory'],
      required: true,
      index: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['unknown', 'passing', 'attention', 'failing'],
      required: true,
    },
    issues: { type: [String], default: [] },
    lastSyncedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: null },
    ownerTeam: { type: String, required: false },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  },
);

export type FinancialComplianceStatusDocument = HydratedDocument<FinancialComplianceStatusEntity>;

export const FinancialComplianceStatusModel: Model<FinancialComplianceStatusEntity> =
  model<FinancialComplianceStatusEntity>(
    'FinancialComplianceStatus',
    financialComplianceStatusSchema,
  );
