import { randomUUID } from 'crypto';

import type {
  ComplianceEvidence,
  ComplianceRequirementStatus,
  FinancialComplianceStatus,
} from '@popflash/shared';

import {
  appendEvidenceToRequirement,
  getFrameworkSummaries,
  getRequirementById,
  listRequirements,
  updateRequirementById,
  type RequirementFilters,
} from '../repositories/compliance-requirement-repository.js';
import { getVerificationStatusCounts } from '../repositories/compliance-verification-repository.js';
import { listFinancialStatuses } from '../repositories/financial-status-repository.js';
import { HttpError } from '../utils/http-error.js';

import { recordAuditEvent } from './audit-service.js';

export const listComplianceRequirements = (filters: RequirementFilters) =>
  listRequirements(filters);

export const getComplianceSummary = async () => {
  const [frameworks, verificationCounts, financialStatuses] = await Promise.all([
    getFrameworkSummaries(),
    getVerificationStatusCounts(),
    listFinancialStatuses(),
  ]);

  return {
    frameworks,
    verificationCounts,
    financialStatuses: financialStatuses.map(
      (status: FinancialComplianceStatus & { _id?: string }) => ({
        id: status._id ? status._id.toString() : status.id,
        platform: status.platform,
        status: status.status,
        issues: status.issues,
        lastSyncedAt: status.lastSyncedAt,
        nextReviewAt: status.nextReviewAt,
        ownerTeam: status.ownerTeam,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      }),
    ),
  };
};

export const updateRequirementStatus = async (
  id: string,
  status: ComplianceRequirementStatus,
  context: { actorId?: string; actorLabel?: string },
) => {
  const requirement = await updateRequirementById(id, {
    status,
    lastReviewedAt: new Date(),
  });

  if (!requirement) {
    throw new HttpError(404, `Requirement ${id} not found`);
  }

  const actorType = context.actorId ? 'user' : 'system';

  await recordAuditEvent({
    eventType: 'compliance.requirement.status_change',
    description: `Requirement ${requirement.key} marked ${status}`,
    severity: status === 'complete' ? 'low' : 'medium',
    actorType,
    actorId: context.actorId ?? null,
    actorLabel: context.actorLabel,
    source: 'compliance-service',
    metadata: {
      requirementId: requirement._id.toString(),
      framework: requirement.framework,
      status,
    },
  });

  return requirement;
};

export const addRequirementEvidence = async (
  id: string,
  evidenceInput: Omit<ComplianceEvidence, 'id' | 'uploadedAt' | 'requirementId'>,
  context: { actorId?: string; actorLabel?: string },
) => {
  const existing = await getRequirementById(id);

  if (!existing) {
    throw new HttpError(404, `Requirement ${id} not found`);
  }

  const evidence: ComplianceEvidence = {
    ...evidenceInput,
    id: randomUUID(),
    requirementId: existing._id.toString(),
    uploadedAt: new Date(),
  };

  const updated = await appendEvidenceToRequirement(id, evidence);

  if (!updated) {
    throw new HttpError(500, 'Failed to append evidence to requirement');
  }

  const actorType = context.actorId ? 'user' : 'system';

  await recordAuditEvent({
    eventType: 'compliance.requirement.evidence_added',
    description: `Evidence added to requirement ${existing.key}`,
    severity: 'low',
    actorType,
    actorId: context.actorId ?? null,
    actorLabel: context.actorLabel,
    source: 'compliance-service',
    metadata: {
      requirementId: existing._id.toString(),
      evidenceId: evidence.id,
      evidenceType: evidence.type,
    },
  });

  return updated;
};
