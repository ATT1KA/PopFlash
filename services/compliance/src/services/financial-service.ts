import type { ComplianceHealth, CompliancePlatform } from '@popflash/shared';

import {
  getFinancialStatusByPlatform,
  listFinancialStatuses,
  upsertFinancialStatus,
} from '../repositories/financial-status-repository.js';
import { HttpError } from '../utils/http-error.js';

import { recordAuditEvent } from './audit-service.js';

export const listComplianceFinancialStatuses = () => listFinancialStatuses();

export const updateFinancialStatus = async (
  platform: CompliancePlatform,
  input: {
    status: ComplianceHealth;
    issues?: string[];
    lastSyncedAt?: Date | null;
    nextReviewAt?: Date | null;
    ownerTeam?: string;
  },
) => {
  const previous = await getFinancialStatusByPlatform(platform);

  const status = await upsertFinancialStatus({
    platform,
    status: input.status,
    issues: input.issues,
    lastSyncedAt: input.lastSyncedAt ?? null,
    nextReviewAt: input.nextReviewAt ?? null,
    ownerTeam: input.ownerTeam,
  });

  if (!status) {
    throw new HttpError(500, 'Unable to persist financial compliance status');
  }

  await recordAuditEvent({
    eventType: 'compliance.financial.status_change',
    description: `Financial compliance for ${platform} marked ${input.status}`,
    severity: input.status === 'failing' ? 'high' : 'medium',
    actorType: 'system',
    source: 'compliance-service',
    metadata: {
      platform,
      previousStatus: previous?.status ?? 'unknown',
      newStatus: input.status,
      issues: input.issues ?? [],
    },
  });

  return status;
};
