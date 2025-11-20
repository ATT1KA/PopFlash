import { randomUUID } from 'crypto';

import type {
  ComplianceVerification,
  VerificationScope,
  VerificationStatus,
} from '@popflash/shared';

import { env } from '../config/env.js';
import {
  createVerification,
  getVerificationById,
  listVerifications,
  updateVerificationStatus,
  type VerificationFilters,
} from '../repositories/compliance-verification-repository.js';
import { HttpError } from '../utils/http-error.js';

import { recordAuditEvent } from './audit-service.js';

export interface StartVerificationInput {
  relatedEntityType: ComplianceVerification['relatedEntityType'];
  relatedEntityId: string;
  scope: VerificationScope[];
  notes?: string;
  initiatedByUserId?: string;
  initiatedByLabel?: string;
}

export const listComplianceVerifications = (filters: VerificationFilters) =>
  listVerifications(filters);

export const startVerification = async (
  input: StartVerificationInput,
): Promise<ComplianceVerification> => {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + env.verificationExpiryHours);

  const verification: ComplianceVerification = {
    id: randomUUID(),
    relatedEntityType: input.relatedEntityType,
    relatedEntityId: input.relatedEntityId,
    scope: input.scope,
    status: 'pending',
    notes: input.notes,
    reviewerUserId: null,
    evidenceIds: [],
    initiatedAt: now,
    completedAt: null,
    expiresAt,
    lastUpdatedAt: now,
  };

  await createVerification(verification);

  await recordAuditEvent({
    eventType: 'compliance.verification.started',
    description: `Verification started for ${verification.relatedEntityType}:${verification.relatedEntityId}`,
    severity: 'medium',
    actorType: input.initiatedByUserId ? 'user' : 'system',
    actorId: input.initiatedByUserId ?? null,
    actorLabel: input.initiatedByLabel,
    source: 'compliance-service',
    metadata: {
      verificationId: verification.id,
      scope: verification.scope,
      expiresAt: verification.expiresAt,
    },
  });

  return verification;
};

export const updateVerification = async (
  id: string,
  update: {
    status: VerificationStatus;
    notes?: string;
    reviewerUserId?: string;
    evidenceIds?: string[];
  },
  context: { actorLabel?: string },
) => {
  const existing = await getVerificationById(id);

  if (!existing) {
    throw new HttpError(404, `Verification ${id} not found`);
  }

  const updated = await updateVerificationStatus(id, {
    status: update.status,
    notes: update.notes ?? existing.notes,
    reviewerUserId: update.reviewerUserId ?? existing.reviewerUserId ?? null,
    evidenceIds: update.evidenceIds ?? existing.evidenceIds,
    completedAt: existing.completedAt,
  });

  if (!updated) {
    throw new HttpError(500, 'Failed to update verification');
  }

  await recordAuditEvent({
    eventType: 'compliance.verification.status_change',
    description: `Verification ${id} marked ${update.status}`,
    severity: update.status === 'failed' ? 'high' : 'medium',
    actorType: update.reviewerUserId || existing.reviewerUserId ? 'user' : 'system',
    actorId: update.reviewerUserId ?? existing.reviewerUserId ?? null,
    actorLabel: context.actorLabel,
    source: 'compliance-service',
    metadata: {
      verificationId: id,
      status: update.status,
    },
  });

  return updated;
};
