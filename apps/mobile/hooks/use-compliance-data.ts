import type {
  ComplianceFramework,
  ComplianceRequirementStatus,
  VerificationScope,
  VerificationStatus,
} from '@popflash/shared';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type {
  ComplianceSummary,
  ComplianceRequirementResponse,
  ComplianceAuditResponse,
  ComplianceVerificationResponse,
  ComplianceFinancialResponse,
} from '@lib/compliance-api';
import {
  complianceApiBaseUrl,
  fetchComplianceAuditEvents,
  fetchComplianceRequirements,
  fetchComplianceSummary,
  fetchComplianceVerifications,
  fetchFinancialStatuses,
} from '@lib/compliance-api';

const isApiConfigured = Boolean(complianceApiBaseUrl);

export const useComplianceSummary = (token?: string) =>
  useQuery<ComplianceSummary, Error>({
    queryKey: ['compliance', 'summary', token],
    queryFn: () => fetchComplianceSummary({ token }),
    enabled: isApiConfigured,
  });

export interface RequirementFilters {
  framework?: ComplianceFramework;
  status?: ComplianceRequirementStatus;
  ownerUserId?: string;
  includeEvidence?: boolean;
}

export const useComplianceRequirements = (filters: RequirementFilters = {}, token?: string) => {
  const query = useMemo(
    () => ({
      framework: filters.framework,
      status: filters.status,
      ownerUserId: filters.ownerUserId,
      includeEvidence: filters.includeEvidence,
    }),
    [filters.framework, filters.status, filters.ownerUserId, filters.includeEvidence],
  );

  return useQuery<ComplianceRequirementResponse, Error>({
    queryKey: ['compliance', 'requirements', query, token],
    queryFn: () => fetchComplianceRequirements({ token, query }),
    enabled: isApiConfigured,
  });
};

export interface VerificationFilters {
  relatedEntityType?: 'escrow' | 'trade' | 'user' | 'organization';
  relatedEntityId?: string;
  status?: VerificationStatus;
  scope?: VerificationScope;
  limit?: number;
}

export const useComplianceVerifications = (filters: VerificationFilters = {}, token?: string) => {
  const query = useMemo(
    () => ({
      relatedEntityType: filters.relatedEntityType,
      relatedEntityId: filters.relatedEntityId,
      status: filters.status,
      scope: filters.scope,
      limit: filters.limit,
    }),
    [
      filters.relatedEntityType,
      filters.relatedEntityId,
      filters.status,
      filters.scope,
      filters.limit,
    ],
  );

  return useQuery<ComplianceVerificationResponse, Error>({
    queryKey: ['compliance', 'verifications', query, token],
    queryFn: () => fetchComplianceVerifications({ token, query }),
    enabled: isApiConfigured,
  });
};

export interface AuditFilters {
  limit?: number;
  severity?: string;
  eventType?: string;
  actorId?: string;
  after?: Date;
}

export const useComplianceAuditEvents = (filters: AuditFilters = {}, token?: string) => {
  const query = useMemo(
    () => ({
      limit: filters.limit,
      severity: filters.severity,
      eventType: filters.eventType,
      actorId: filters.actorId,
      after: filters.after?.toISOString(),
    }),
    [filters.limit, filters.severity, filters.eventType, filters.actorId, filters.after],
  );

  return useQuery<ComplianceAuditResponse, Error>({
    queryKey: ['compliance', 'audit-events', query, token],
    queryFn: () => fetchComplianceAuditEvents({ token, query }),
    enabled: isApiConfigured,
  });
};

export const useFinancialStatuses = (token?: string) =>
  useQuery<ComplianceFinancialResponse, Error>({
    queryKey: ['compliance', 'financial-statuses', token],
    queryFn: () => fetchFinancialStatuses({ token }),
    enabled: isApiConfigured,
  });
