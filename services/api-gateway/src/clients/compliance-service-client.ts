import type {
  AuditEvent,
  AuditEventActorType,
  AuditEventSeverity,
  ComplianceEvidenceType,
  ComplianceFramework,
  ComplianceHealth,
  CompliancePlatform,
  ComplianceRequirement,
  ComplianceRequirementStatus,
  ComplianceVerification,
  FinancialComplianceStatus,
  VerificationScope,
  VerificationStatus,
} from '@popflash/shared';

import { config } from '../config.js';

import { createHttpClient, get, patch, post } from './http-client.js';

const client = createHttpClient(config.complianceServiceUrl, config.requestTimeoutMs);

interface RequestOptions {
  authHeader?: string;
}

export interface ComplianceSummary {
  frameworks: Array<{
    framework: ComplianceFramework;
    total: number;
    byStatus: Record<ComplianceRequirementStatus, number>;
  }>;
  verificationCounts: Partial<Record<VerificationStatus, number>>;
  financialStatuses: Array<FinancialComplianceStatus & { id: string }>;
}

export interface ComplianceRequirementFilters {
  framework?: ComplianceFramework;
  status?: ComplianceRequirementStatus;
  ownerUserId?: string;
  includeEvidence?: boolean;
}

export interface AuditEventFilters {
  limit?: number;
  severity?: AuditEventSeverity;
  eventType?: string;
  actorId?: string;
  after?: Date;
}

export interface VerificationFilters {
  relatedEntityType?: ComplianceVerification['relatedEntityType'];
  relatedEntityId?: string;
  status?: VerificationStatus;
  scope?: VerificationScope;
  limit?: number;
}

export const fetchComplianceSummary = (options: RequestOptions = {}) =>
  get<ComplianceSummary>(client, '/v1/compliance/summary', {
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const listComplianceRequirements = (
  filters: ComplianceRequirementFilters = {},
  options: RequestOptions = {},
) =>
  get<ComplianceRequirement[]>(client, '/v1/compliance/requirements', {
    params: {
      framework: filters.framework,
      status: filters.status,
      ownerUserId: filters.ownerUserId,
      includeEvidence: filters.includeEvidence,
    },
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const updateComplianceRequirementStatus = (
  id: string,
  status: ComplianceRequirementStatus,
  context: { actorId?: string; actorLabel?: string } = {},
  options: RequestOptions = {},
) =>
  patch<ComplianceRequirement>(
    client,
    `/v1/compliance/requirements/${id}/status`,
    {
      status,
      actorId: context.actorId,
      actorLabel: context.actorLabel,
    },
    {
      headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
    },
  );

export const addComplianceRequirementEvidence = (
  id: string,
  payload: {
    title: string;
    type: ComplianceEvidenceType;
    uri?: string;
    storedAt?: string;
    uploadedByUserId?: string | null;
    verifiedByUserId?: string | null;
    verifiedAt?: Date | null;
    notes?: string;
  },
  context: { actorId?: string; actorLabel?: string } = {},
  options: RequestOptions = {},
) =>
  post<ComplianceRequirement>(
    client,
    `/v1/compliance/requirements/${id}/evidence`,
    {
      ...payload,
      actorId: context.actorId,
      actorLabel: context.actorLabel,
    },
    {
      headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
    },
  );

export const listAuditEvents = (filters: AuditEventFilters = {}, options: RequestOptions = {}) =>
  get<AuditEvent[]>(client, '/v1/compliance/audit-events', {
    params: {
      limit: filters.limit,
      severity: filters.severity,
      eventType: filters.eventType,
      actorId: filters.actorId,
      after: filters.after?.toISOString(),
    },
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const createAuditEvent = (
  payload: {
    eventType: string;
    description: string;
    severity: AuditEventSeverity;
    actorType: AuditEventActorType;
    actorId?: string | null;
    actorLabel?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  },
  options: RequestOptions = {},
) =>
  post<AuditEvent>(client, '/v1/compliance/audit-events', payload, {
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const listComplianceVerifications = (
  filters: VerificationFilters = {},
  options: RequestOptions = {},
) =>
  get<ComplianceVerification[]>(client, '/v1/compliance/verifications', {
    params: {
      relatedEntityType: filters.relatedEntityType,
      relatedEntityId: filters.relatedEntityId,
      status: filters.status,
      scope: filters.scope,
      limit: filters.limit,
    },
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const startComplianceVerification = (
  payload: {
    relatedEntityType: ComplianceVerification['relatedEntityType'];
    relatedEntityId: string;
    scope: VerificationScope[];
    notes?: string;
    initiatedByUserId?: string;
    initiatedByLabel?: string;
  },
  options: RequestOptions = {},
) =>
  post<ComplianceVerification>(client, '/v1/compliance/verifications', payload, {
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const updateComplianceVerificationStatus = (
  id: string,
  payload: {
    status: VerificationStatus;
    notes?: string;
    reviewerUserId?: string;
    evidenceIds?: string[];
    actorLabel?: string;
  },
  options: RequestOptions = {},
) =>
  patch<ComplianceVerification>(client, `/v1/compliance/verifications/${id}/status`, payload, {
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const listFinancialComplianceStatuses = (options: RequestOptions = {}) =>
  get<Array<FinancialComplianceStatus & { id: string }>>(client, '/v1/compliance/financial', {
    headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
  });

export const updateFinancialComplianceStatus = (
  platform: CompliancePlatform,
  payload: {
    status: ComplianceHealth;
    issues?: string[];
    lastSyncedAt?: Date | null;
    nextReviewAt?: Date | null;
    ownerTeam?: string;
  },
  options: RequestOptions = {},
) =>
  patch<FinancialComplianceStatus & { id: string }>(
    client,
    `/v1/compliance/financial/${platform}`,
    payload,
    {
      headers: options.authHeader ? { Authorization: options.authHeader } : undefined,
    },
  );
