import { randomUUID } from 'crypto';

import type { ComplianceVerification } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type ComplianceVerificationEntity = ComplianceVerification & { _id: string };

const complianceVerificationSchema = new Schema<ComplianceVerificationEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    relatedEntityType: {
      type: String,
      enum: ['escrow', 'trade', 'user', 'organization'],
      required: true,
      index: true,
    },
    relatedEntityId: { type: String, required: true, index: true },
    scope: {
      type: [
        {
          type: String,
          enum: [
            'kyc',
            'kyb',
            'proof_of_funds',
            'payment_processor',
            'ios_app_store',
            'android_play_store',
            'government_watchlist',
          ],
        },
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'passed', 'failed', 'expired'],
      required: true,
      index: true,
    },
    notes: { type: String, required: false },
    reviewerUserId: { type: String, required: false },
    evidenceIds: { type: [String], default: [] },
    initiatedAt: { type: Date, required: true },
    completedAt: { type: Date, required: false, default: null },
    expiresAt: { type: Date, required: false, default: null },
    lastUpdatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  },
);

complianceVerificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1, status: 1 });
complianceVerificationSchema.index({ expiresAt: 1 });

export type ComplianceVerificationDocument = HydratedDocument<ComplianceVerificationEntity>;

export const ComplianceVerificationModel: Model<ComplianceVerificationEntity> =
  model<ComplianceVerificationEntity>('ComplianceVerification', complianceVerificationSchema);
