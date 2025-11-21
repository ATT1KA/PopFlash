import type {
  AuditEventSeverity,
  ComplianceHealth,
  ComplianceRequirementStatus,
  VerificationStatus,
} from '@popflash/shared';

export const formatDateTime = (
  value?: Date | string | null,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!value) {
    return '—';
  }

  const date = typeof value === 'string' ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
};

type PaletteToken = {
  label: string;
  color: string;
  background: string;
};

const requirementPalette: Record<ComplianceRequirementStatus, PaletteToken> = {
  not_started: { label: 'Not Started', color: '#64748b', background: '#1e293b26' },
  in_progress: { label: 'In Progress', color: '#3A7FFF', background: '#3a7fff26' },
  blocked: { label: 'Blocked', color: '#f97316', background: '#f9731626' },
  complete: { label: 'Complete', color: '#10b981', background: '#10b98126' },
  deferred: { label: 'Deferred', color: '#a855f7', background: '#a855f726' },
};

const verificationPalette: Record<VerificationStatus, PaletteToken> = {
  pending: { label: 'Pending', color: '#f59e0b', background: '#f59e0b26' },
  in_review: { label: 'In Review', color: '#3A7FFF', background: '#3a7fff26' },
  passed: { label: 'Passed', color: '#10b981', background: '#10b98126' },
  failed: { label: 'Failed', color: '#ef4444', background: '#ef444426' },
  expired: { label: 'Expired', color: '#64748b', background: '#64748b26' },
};

const severityPalette: Record<AuditEventSeverity, PaletteToken> = {
  info: { label: 'Info', color: '#38bdf8', background: '#38bdf826' },
  notice: { label: 'Notice', color: '#a855f7', background: '#a855f726' },
  warning: { label: 'Warning', color: '#f97316', background: '#f9731626' },
  critical: { label: 'Critical', color: '#ef4444', background: '#ef444426' },
};

const healthPalette: Record<ComplianceHealth, PaletteToken> = {
  passing: { label: 'Passing', color: '#10b981', background: '#10b98126' },
  attention: { label: 'Needs Attention', color: '#f97316', background: '#f9731626' },
  failing: { label: 'Failing', color: '#ef4444', background: '#ef444426' },
  unknown: { label: 'Unknown', color: '#94a3b8', background: '#94a3b826' },
};

export const getRequirementStatusToken = (status: ComplianceRequirementStatus) =>
  requirementPalette[status];

export const getVerificationStatusToken = (status: VerificationStatus) =>
  verificationPalette[status];

export const getSeverityToken = (severity: AuditEventSeverity) => severityPalette[severity];

export const getHealthToken = (health: ComplianceHealth) => healthPalette[health];
