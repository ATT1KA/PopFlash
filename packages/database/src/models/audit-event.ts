import { randomUUID } from 'crypto';

import type { AuditEvent } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type AuditEventEntity = AuditEvent & { _id: string };

const auditEventSchema = new Schema<AuditEventEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    eventType: { type: String, required: true, index: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['info', 'notice', 'warning', 'critical'], required: true },
    actorType: { type: String, enum: ['user', 'system', 'integration'], required: true },
    actorId: { type: String, required: false, index: true },
    actorLabel: { type: String, required: false },
    source: { type: String, required: true, index: true },
    occurredAt: { type: Date, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    versionKey: false,
  },
);

auditEventSchema.index({ occurredAt: -1 });
auditEventSchema.index({ severity: 1, occurredAt: -1 });

export type AuditEventDocument = HydratedDocument<AuditEventEntity>;

export const AuditEventModel: Model<AuditEventEntity> = model<AuditEventEntity>(
  'AuditEvent',
  auditEventSchema,
);
