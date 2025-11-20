import { randomUUID } from 'crypto';

import type { ComplianceEvidence, ComplianceRequirement } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type ComplianceRequirementEntity = ComplianceRequirement & { _id: string };

const evidenceSchema = new Schema<ComplianceEvidence>(
  {
    id: { type: String, required: true },
    requirementId: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'policy',
        'log_capture',
        'screenshot',
        'attestation',
        'report',
        'certificate',
        'other',
      ],
      required: true,
    },
    uri: { type: String, required: false },
    storedAt: { type: String, required: false },
    uploadedByUserId: { type: String, required: false },
    uploadedAt: { type: Date, required: true },
    verifiedByUserId: { type: String, required: false },
    verifiedAt: { type: Date, required: false },
    notes: { type: String, required: false },
  },
  { _id: false },
);

const complianceRequirementSchema = new Schema<ComplianceRequirementEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    framework: {
      type: String,
      enum: ['soc2', 'ios_app_store', 'android_play_store', 'payment_processor', 'regulatory'],
      required: true,
      index: true,
    },
    key: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'blocked', 'complete', 'deferred'],
      required: true,
      index: true,
    },
    ownerUserId: { type: String, default: null, index: true },
    dueDate: { type: Date, default: null },
    lastReviewedAt: { type: Date, default: null },
    evidence: { type: [evidenceSchema], default: [] },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  },
);

complianceRequirementSchema.index({ framework: 1, key: 1 }, { unique: true });
complianceRequirementSchema.index({ dueDate: 1 });

export type ComplianceRequirementDocument = HydratedDocument<ComplianceRequirementEntity>;

export const ComplianceRequirementModel: Model<ComplianceRequirementEntity> =
  model<ComplianceRequirementEntity>('ComplianceRequirement', complianceRequirementSchema);
