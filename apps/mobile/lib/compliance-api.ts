import Constants from 'expo-constants';
import { z } from 'zod';

import {
  auditEventSchema,
  complianceRequirementSchema,
  complianceRequirementStatusSchema,
  complianceVerificationSchema,
  financialComplianceStatusSchema,
  verificationStatusSchema,
} from '@popflash/shared';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? Constants.expoConfig?.extra?.apiBaseUrl ?? '';

export const complianceApiBaseUrl = API_BASE_URL;

if (!API_BASE_URL) {
  console.warn(
    'EXPO_PUBLIC_API_BASE_URL is not configured. The mobile compliance views will not be able to fetch live data.',
  );
}

const summarySchema = z.object({
  frameworks: z.array(
    z.object({
      framework: complianceRequirementSchema.shape.framework,
      total: z.number().nonnegative(),
      byStatus: z.record(complianceRequirementStatusSchema, z.number().nonnegative()).optional(),
    }),
  ),
  verificationCounts: z.record(verificationStatusSchema, z.number().nonnegative()).partial(),
  financialStatuses: z.array(
    financialComplianceStatusSchema.extend({
      id: z.string(),
    }),
  ),
});

const requirementsResponseSchema = z.object({
  requirements: z.array(complianceRequirementSchema),
});

const auditEventsResponseSchema = z.object({
  events: z.array(auditEventSchema),
});

const verificationsResponseSchema = z.object({
  verifications: z.array(complianceVerificationSchema),
});

const financialStatusResponseSchema = z.object({
  statuses: z.array(
    financialComplianceStatusSchema.extend({
      id: z.string(),
    }),
  ),
});

export type ComplianceSummary = z.infer<typeof summarySchema>;
export type ComplianceRequirementResponse = z.infer<typeof requirementsResponseSchema>;
export type ComplianceAuditResponse = z.infer<typeof auditEventsResponseSchema>;
export type ComplianceVerificationResponse = z.infer<typeof verificationsResponseSchema>;
export type ComplianceFinancialResponse = z.infer<typeof financialStatusResponseSchema>;

interface RequestOptions {
  token?: string;
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined>;
}

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const url = new URL(path, API_BASE_URL || 'http://localhost');

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
};

const request = async <T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}) => {
  if (!API_BASE_URL) {
    throw new Error('Compliance API base URL is not configured.');
  }

  const response = await fetch(buildUrl(path, options.query), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: options.token } : {}),
    },
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Compliance API request failed (${response.status}): ${text}`);
  }

  const json = await response.json();

  return schema.parse(json);
};

export const fetchComplianceSummary = (options: RequestOptions = {}) =>
  request('/v1/compliance/summary', summarySchema, options);

export const fetchComplianceRequirements = (options: RequestOptions = {}) =>
  request('/v1/compliance/requirements', requirementsResponseSchema, options);

export const fetchComplianceAuditEvents = (options: RequestOptions = {}) =>
  request('/v1/compliance/audit-events', auditEventsResponseSchema, options);

export const fetchComplianceVerifications = (options: RequestOptions = {}) =>
  request('/v1/compliance/verifications', verificationsResponseSchema, options);

export const fetchFinancialStatuses = (options: RequestOptions = {}) =>
  request('/v1/compliance/financial', financialStatusResponseSchema, options);