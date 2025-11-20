import { z } from 'zod';

export const complianceFrameworkSchema = z.enum([
  'soc2',
  'ios_app_store',
  'android_play_store',
  'payment_processor',
  'regulatory',
]);

export const complianceRequirementStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'blocked',
  'complete',
  'deferred',
]);

export const complianceEvidenceTypeSchema = z.enum([
  'policy',
  'log_capture',
  'screenshot',
  'attestation',
  'report',
  'certificate',
  'other',
]);

export const complianceEvidenceSchema = z.object({
  id: z.string(),
  requirementId: z.string(),
  title: z.string(),
  type: complianceEvidenceTypeSchema,
  uri: z.string().url().optional(),
  storedAt: z.string().optional(),
  uploadedByUserId: z.string().nullable().optional(),
  uploadedAt: z.coerce.date(),
  verifiedByUserId: z.string().nullable().optional(),
  verifiedAt: z.coerce.date().nullable().optional(),
  notes: z.string().optional(),
});

export const complianceRequirementSchema = z.object({
  id: z.string(),
  framework: complianceFrameworkSchema,
  key: z.string(),
  title: z.string(),
  description: z.string(),
  status: complianceRequirementStatusSchema,
  ownerUserId: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  lastReviewedAt: z.coerce.date().nullable().optional(),
  evidence: z.array(complianceEvidenceSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const auditEventSeveritySchema = z.enum(['info', 'notice', 'warning', 'critical']);
export const auditEventActorTypeSchema = z.enum(['user', 'system', 'integration']);

export const auditEventSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  description: z.string(),
  severity: auditEventSeveritySchema,
  actorType: auditEventActorTypeSchema,
  actorId: z.string().nullable().optional(),
  actorLabel: z.string().optional(),
  source: z.string(),
  occurredAt: z.coerce.date(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.coerce.date(),
});

export const verificationScopeSchema = z.enum([
  'kyc',
  'kyb',
  'proof_of_funds',
  'payment_processor',
  'ios_app_store',
  'android_play_store',
  'government_watchlist',
]);

export const verificationStatusSchema = z.enum([
  'pending',
  'in_review',
  'passed',
  'failed',
  'expired',
]);

export const complianceVerificationSchema = z.object({
  id: z.string(),
  relatedEntityType: z.enum(['escrow', 'trade', 'user', 'organization']),
  relatedEntityId: z.string(),
  scope: z.array(verificationScopeSchema).min(1),
  status: verificationStatusSchema,
  notes: z.string().optional(),
  reviewerUserId: z.string().nullable().optional(),
  evidenceIds: z.array(z.string()).default([]),
  initiatedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  lastUpdatedAt: z.coerce.date(),
});

export const complianceHealthSchema = z.enum(['unknown', 'passing', 'attention', 'failing']);
export const compliancePlatformSchema = z.enum([
  'ios_app_store',
  'android_play_store',
  'payment_processor',
  'regulatory',
]);

export const financialComplianceStatusSchema = z.object({
  id: z.string(),
  platform: compliancePlatformSchema,
  status: complianceHealthSchema,
  issues: z.array(z.string()).default([]),
  lastSyncedAt: z.coerce.date().nullable().optional(),
  nextReviewAt: z.coerce.date().nullable().optional(),
  ownerTeam: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ComplianceFramework = z.infer<typeof complianceFrameworkSchema>;
export type ComplianceRequirementStatus = z.infer<typeof complianceRequirementStatusSchema>;
export type ComplianceEvidenceType = z.infer<typeof complianceEvidenceTypeSchema>;
export type ComplianceEvidence = z.infer<typeof complianceEvidenceSchema>;
export type ComplianceRequirement = z.infer<typeof complianceRequirementSchema>;
export type AuditEventSeverity = z.infer<typeof auditEventSeveritySchema>;
export type AuditEventActorType = z.infer<typeof auditEventActorTypeSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type VerificationScope = z.infer<typeof verificationScopeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type ComplianceVerification = z.infer<typeof complianceVerificationSchema>;
export type ComplianceHealth = z.infer<typeof complianceHealthSchema>;
export type CompliancePlatform = z.infer<typeof compliancePlatformSchema>;
export type FinancialComplianceStatus = z.infer<typeof financialComplianceStatusSchema>;
