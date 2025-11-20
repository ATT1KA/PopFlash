import type {
  AuditEvent,
  ComplianceEvidence,
  ComplianceFramework,
  ComplianceHealth,
  ComplianceRequirement,
  ComplianceRequirementStatus,
  ComplianceVerification,
  FinancialComplianceStatus,
  VerificationStatus,
} from '@popflash/shared';
import {
  AlertTriangle,
  Building2,
  CircleHelp,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Smartphone,
  Store,
} from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';
import type { ComponentType } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_GATEWAY_URL ?? 'http://localhost:4000';

type IsoDate = string;

type SerializedEvidence = Omit<ComplianceEvidence, 'uploadedAt' | 'verifiedAt'> & {
  uploadedAt: IsoDate;
  verifiedAt?: IsoDate | null;
};

type SerializedRequirement = Omit<
  ComplianceRequirement,
  'dueDate' | 'lastReviewedAt' | 'createdAt' | 'updatedAt' | 'evidence'
> & {
  dueDate?: IsoDate | null;
  lastReviewedAt?: IsoDate | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
  evidence: SerializedEvidence[];
};

type SerializedAuditEvent = Omit<AuditEvent, 'occurredAt' | 'createdAt'> & {
  occurredAt: IsoDate;
  createdAt: IsoDate;
};

type SerializedVerification = Omit<
  ComplianceVerification,
  'initiatedAt' | 'completedAt' | 'expiresAt' | 'lastUpdatedAt'
> & {
  initiatedAt: IsoDate;
  completedAt?: IsoDate | null;
  expiresAt?: IsoDate | null;
  lastUpdatedAt: IsoDate;
};

type SerializedFinancialStatus = Omit<
  FinancialComplianceStatus,
  'lastSyncedAt' | 'nextReviewAt' | 'createdAt' | 'updatedAt'
> & {
  lastSyncedAt?: IsoDate | null;
  nextReviewAt?: IsoDate | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
};

type ComplianceSummaryResponse = {
  frameworks: Array<{
    framework: ComplianceFramework;
    total: number;
    byStatus: Record<ComplianceRequirementStatus, number>;
  }>;
  verificationCounts: Partial<Record<VerificationStatus, number>>;
  financialStatuses: Array<SerializedFinancialStatus & { id: string }>;
};

type ComplianceSummary = {
  frameworks: Array<{
    framework: ComplianceFramework;
    total: number;
    byStatus: Record<ComplianceRequirementStatus, number>;
  }>;
  verificationCounts: Partial<Record<VerificationStatus, number>>;
  financialStatuses: Array<FinancialComplianceStatus & { id: string }>;
};

interface ComplianceData {
  summary: ComplianceSummary | null;
  summaryError: string | null;
  requirements: ComplianceRequirement[];
  requirementsError: string | null;
  auditEvents: AuditEvent[];
  auditError: string | null;
  verifications: ComplianceVerification[];
  verificationsError: string | null;
}

const frameworkConfig: Record<
  ComplianceFramework,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  soc2: { label: 'SOC 2', icon: ShieldCheck },
  ios_app_store: { label: 'iOS App Store', icon: Store },
  android_play_store: { label: 'Google Play', icon: Smartphone },
  payment_processor: { label: 'Payment Processors', icon: CreditCard },
  regulatory: { label: 'Regulatory', icon: Building2 },
};

const requirementStatusConfig: Record<
  ComplianceRequirementStatus,
  { label: string; className: string; emphasis?: boolean }
> = {
  not_started: {
    label: 'Not started',
    className: 'border-white/10 bg-white/5 text-textSecondary',
  },
  in_progress: {
    label: 'In progress',
    className: 'border-primary/40 bg-primary/10 text-primary',
    emphasis: true,
  },
  blocked: {
    label: 'Blocked',
    className: 'border-red-500/40 bg-red-500/10 text-red-200',
    emphasis: true,
  },
  complete: {
    label: 'Complete',
    className: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200',
  },
  deferred: {
    label: 'Deferred',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  },
};

const verificationStatusConfig: Record<
  VerificationStatus,
  { label: string; className: string; accent: string }
> = {
  pending: {
    label: 'Pending',
    className: 'border-white/10 bg-white/5 text-textSecondary',
    accent: 'bg-white/30',
  },
  in_review: {
    label: 'In review',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    accent: 'bg-amber-400/40',
  },
  passed: {
    label: 'Passed',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    accent: 'bg-emerald-400/40',
  },
  failed: {
    label: 'Failed',
    className: 'border-red-500/40 bg-red-500/10 text-red-200',
    accent: 'bg-red-500/50',
  },
  expired: {
    label: 'Expired',
    className: 'border-white/10 bg-white/5 text-textSecondary/70',
    accent: 'bg-white/20',
  },
};

const financialHealthConfig: Record<
  ComplianceHealth,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  passing: {
    label: 'Passing',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    icon: ShieldCheck,
  },
  attention: {
    label: 'Needs attention',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
    icon: AlertTriangle,
  },
  failing: {
    label: 'Failing',
    className: 'border-red-500/50 bg-red-500/10 text-red-200',
    icon: ShieldAlert,
  },
  unknown: {
    label: 'Unknown',
    className: 'border-white/10 bg-white/5 text-textSecondary',
    icon: CircleHelp,
  },
};

const verificationSummaryOrder: VerificationStatus[] = [
  'passed',
  'in_review',
  'pending',
  'failed',
  'expired',
];

const requirementPriority: Record<ComplianceRequirementStatus, number> = {
  blocked: 0,
  in_progress: 1,
  not_started: 2,
  deferred: 3,
  complete: 4,
};

const toDate = (value?: IsoDate | null): Date | null => (value ? new Date(value) : null);

const formatDate = (value?: Date | null, fallback = 'No due date') =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(value)
    : fallback;

const formatTimestamp = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(value);

const formatRelative = (value: Date | null | undefined) => {
  if (!value) {
    return '—';
  }

  const diff = Date.now() - value.getTime();

  if (diff < 60_000) {
    return 'just now';
  }

  if (diff < 3_600_000) {
    const minutes = Math.round(diff / 60_000);
    return `${minutes}m ago`;
  }

  if (diff < 86_400_000) {
    const hours = Math.round(diff / 3_600_000);
    return `${hours}h ago`;
  }

  const days = Math.round(diff / 86_400_000);
  return `${days}d ago`;
};

const fetchComplianceSummary = async (): Promise<ComplianceSummary> => {
  const response = await fetch(`${API_BASE_URL}/v1/compliance/summary`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load compliance summary: ${response.statusText}`);
  }

  const payload = (await response.json()) as ComplianceSummaryResponse;

  return {
    frameworks: payload.frameworks,
    verificationCounts: payload.verificationCounts,
    financialStatuses: payload.financialStatuses.map((status) => ({
      ...status,
      lastSyncedAt: toDate(status.lastSyncedAt ?? null),
      nextReviewAt: toDate(status.nextReviewAt ?? null),
      createdAt: new Date(status.createdAt),
      updatedAt: new Date(status.updatedAt),
    })),
  } satisfies ComplianceSummary;
};

const fetchComplianceRequirements = async (): Promise<ComplianceRequirement[]> => {
  const url = new URL(`${API_BASE_URL}/v1/compliance/requirements`);
  url.searchParams.set('includeEvidence', 'true');

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load compliance requirements: ${response.statusText}`);
  }

  const payload = (await response.json()) as { requirements: SerializedRequirement[] };

  return payload.requirements.map((requirement) => ({
    ...requirement,
    dueDate: toDate(requirement.dueDate ?? null) ?? undefined,
    lastReviewedAt: toDate(requirement.lastReviewedAt ?? null) ?? undefined,
    createdAt: new Date(requirement.createdAt),
    updatedAt: new Date(requirement.updatedAt),
    evidence: requirement.evidence.map((evidence) => ({
      ...evidence,
      uploadedAt: new Date(evidence.uploadedAt),
      verifiedAt: toDate(evidence.verifiedAt ?? null) ?? undefined,
    })),
  }));
};

const fetchAuditEvents = async (): Promise<AuditEvent[]> => {
  const url = new URL(`${API_BASE_URL}/v1/compliance/audit-events`);
  url.searchParams.set('limit', '6');

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load audit events: ${response.statusText}`);
  }

  const payload = (await response.json()) as { events: SerializedAuditEvent[] };

  return payload.events.map((event) => ({
    ...event,
    occurredAt: new Date(event.occurredAt),
    createdAt: new Date(event.createdAt),
  }));
};

const fetchComplianceVerifications = async (): Promise<ComplianceVerification[]> => {
  const url = new URL(`${API_BASE_URL}/v1/compliance/verifications`);
  url.searchParams.set('limit', '6');

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load compliance verifications: ${response.statusText}`);
  }

  const payload = (await response.json()) as { verifications: SerializedVerification[] };

  return payload.verifications.map((verification) => ({
    ...verification,
    initiatedAt: new Date(verification.initiatedAt),
    completedAt: toDate(verification.completedAt ?? null) ?? undefined,
    expiresAt: toDate(verification.expiresAt ?? null) ?? undefined,
    lastUpdatedAt: new Date(verification.lastUpdatedAt),
  }));
};

const loadComplianceData = async (): Promise<ComplianceData> => {
  noStore();

  const result: ComplianceData = {
    summary: null,
    summaryError: null,
    requirements: [],
    requirementsError: null,
    auditEvents: [],
    auditError: null,
    verifications: [],
    verificationsError: null,
  };

  await Promise.all([
    (async () => {
      try {
        result.summary = await fetchComplianceSummary();
      } catch (error) {
        result.summaryError =
          error instanceof Error ? error.message : 'Unknown error fetching compliance summary';
      }
    })(),
    (async () => {
      try {
        result.requirements = await fetchComplianceRequirements();
      } catch (error) {
        result.requirementsError =
          error instanceof Error ? error.message : 'Unknown error fetching compliance requirements';
      }
    })(),
    (async () => {
      try {
        result.auditEvents = await fetchAuditEvents();
      } catch (error) {
        result.auditError =
          error instanceof Error ? error.message : 'Unknown error fetching audit events';
      }
    })(),
    (async () => {
      try {
        result.verifications = await fetchComplianceVerifications();
      } catch (error) {
        result.verificationsError =
          error instanceof Error
            ? error.message
            : 'Unknown error fetching compliance verifications';
      }
    })(),
  ]);

  return result;
};

const RequirementStatusBadge = ({ status }: { status: ComplianceRequirementStatus }) => {
  const config = requirementStatusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide ${config.className}`}
    >
      {config.emphasis ? <ShieldQuestion className="h-3 w-3" aria-hidden /> : null}
      {config.label}
    </span>
  );
};

const VerificationStatusPill = ({ status }: { status: VerificationStatus }) => {
  const config = verificationStatusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide ${config.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.accent}`} />
      {config.label}
    </span>
  );
};

const EvidenceCount = ({ evidence }: { evidence: ComplianceEvidence[] }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-textSecondary">
    <FileText className="h-3 w-3" aria-hidden />
    {evidence.length} evidence
  </span>
);

const FrameworkCard = ({ framework, total, byStatus }: ComplianceSummary['frameworks'][number]) => {
  const config = frameworkConfig[framework];
  const Icon = config.icon;
  const complete = byStatus.complete ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-panel/70">
            <Icon className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-textPrimary">{config.label}</p>
            <p className="text-xs text-textSecondary/80">{total} controls tracked</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-primary">
            {complete}/{total}
          </p>
          <p className="text-[0.65rem] uppercase text-textSecondary">Complete</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-textSecondary">
        {(Object.keys(requirementStatusConfig) as ComplianceRequirementStatus[]).map((status) => (
          <span key={status} className="rounded-full border border-white/5 px-2 py-0.5">
            {requirementStatusConfig[status].label}: {byStatus[status] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
};

const VerificationSummary = ({ counts }: { counts: ComplianceSummary['verificationCounts'] }) => (
  <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-textSecondary">
    {verificationSummaryOrder.map((status) => (
      <span
        key={status}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/60 px-2 py-0.5"
      >
        <span className={`h-2 w-2 rounded-full ${verificationStatusConfig[status].accent}`} />
        {verificationStatusConfig[status].label}
        <span className="font-semibold text-textPrimary">{counts[status] ?? 0}</span>
      </span>
    ))}
  </div>
);

const FinancialStatusCard = ({
  status,
}: {
  status: ComplianceSummary['financialStatuses'][number];
}) => {
  const config = financialHealthConfig[status.status];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 ${config.className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium capitalize text-textPrimary">
              {status.platform.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-textSecondary/80">{config.label}</p>
          </div>
        </div>
        <div className="text-right text-[0.65rem] uppercase text-textSecondary">
          <p>Synced {formatRelative(status.lastSyncedAt ?? null)}</p>
          <p>Next review {formatDate(status.nextReviewAt ?? null, 'No schedule')}</p>
        </div>
      </div>
      {status.issues?.length ? (
        <ul className="mt-3 space-y-2 text-xs text-textSecondary">
          {status.issues.map((issue) => (
            <li key={issue} className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none text-amber-300" aria-hidden />
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {status.ownerTeam ? (
        <p className="mt-3 text-xs text-textSecondary/80">Owner: {status.ownerTeam}</p>
      ) : null}
    </div>
  );
};

export const ComplianceDashboard = async () => {
  const data = await loadComplianceData();

  const activeRequirements = data.requirements
    .filter((requirement) => requirement.status !== 'complete')
    .sort((a, b) => {
      const priorityDiff = requirementPriority[a.status] - requirementPriority[b.status];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const aDue = a.dueDate ? a.dueDate.getTime() : Infinity;
      const bDue = b.dueDate ? b.dueDate.getTime() : Infinity;
      return aDue - bDue;
    })
    .slice(0, 6);

  const completedCount = data.requirements.filter(
    (requirement) => requirement.status === 'complete',
  ).length;
  const verificationQueue = data.verifications.slice(0, 6);
  const auditFeed = data.auditEvents.slice(0, 6);

  const telemetryTimestamps: number[] = [];

  if (data.summary) {
    data.summary.financialStatuses.forEach((status) => {
      telemetryTimestamps.push(status.updatedAt.getTime());
    });
  }

  data.requirements.forEach((requirement) =>
    telemetryTimestamps.push(requirement.updatedAt.getTime()),
  );
  data.verifications.forEach((verification) =>
    telemetryTimestamps.push(verification.lastUpdatedAt.getTime()),
  );
  data.auditEvents.forEach((event) => telemetryTimestamps.push(event.createdAt.getTime()));

  const refreshedAt = telemetryTimestamps.length
    ? new Date(Math.max(...telemetryTimestamps))
    : new Date();

  return (
    <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-semibold text-textPrimary">
            Compliance Command
          </h2>
          <p className="text-sm text-textSecondary">
            Live telemetry across frameworks, verification workflows, and audit trails.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/60 px-3 py-1 text-[0.65rem] uppercase tracking-wide text-textSecondary">
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
          Refreshed {formatRelative(refreshedAt)}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {data.summaryError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/60 p-4 text-red-200">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <div>
              <p className="text-sm font-medium">Unable to load compliance summary</p>
              <p className="text-xs opacity-80">{data.summaryError}</p>
            </div>
          </div>
        ) : null}

        {data.summary ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wide text-textSecondary">
                Framework Posture
              </h3>
              <div className="text-xs text-textSecondary">
                {completedCount} of {data.requirements.length} controls complete
              </div>
            </div>
            <div className="space-y-3">
              {data.summary.frameworks.map((framework) => (
                <FrameworkCard key={framework.framework} {...framework} />
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium uppercase tracking-wide text-textSecondary">
                  Verification Queue
                </h3>
                <VerificationSummary counts={data.summary.verificationCounts} />
              </div>
            </div>
          </div>
        ) : null}

        {data.requirementsError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/60 p-4 text-red-200">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <div>
              <p className="text-sm font-medium">Unable to load compliance requirements</p>
              <p className="text-xs opacity-80">{data.requirementsError}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-textSecondary">
              Critical Requirements
            </h3>
            <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase text-textSecondary">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              {activeRequirements.length > 0
                ? `${activeRequirements.length} of ${data.requirements.length} highlighted`
                : 'All controls satisfied'}
            </span>
          </div>
          {activeRequirements.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              All compliance controls are complete. Monitor audit events for ongoing assurance.
            </div>
          ) : (
            <div className="space-y-3">
              {activeRequirements.map((requirement) => (
                <article
                  key={requirement.id}
                  className="rounded-2xl border border-white/10 bg-background/60 p-4 transition hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{requirement.title}</p>
                      <p className="mt-1 text-xs text-textSecondary/80">
                        {requirement.description}
                      </p>
                    </div>
                    <RequirementStatusBadge status={requirement.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wide text-textSecondary">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      {frameworkConfig[requirement.framework].label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      <Clock className="h-3 w-3" aria-hidden />
                      Due {formatDate(requirement.dueDate ?? null, 'No due date')}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Owner {requirement.ownerUserId ?? 'Unassigned'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Touched {formatRelative(requirement.updatedAt)}
                    </span>
                    <EvidenceCount evidence={requirement.evidence} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {data.verificationsError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/60 p-4 text-red-200">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <div>
              <p className="text-sm font-medium">Unable to load verification activity</p>
              <p className="text-xs opacity-80">{data.verificationsError}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-textSecondary">
              Verification Workflow
            </h3>
            <span className="text-[0.65rem] uppercase text-textSecondary">
              Showing {verificationQueue.length} recent verifications
            </span>
          </div>
          {verificationQueue.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 text-sm text-textSecondary">
              No active verification workflows. New requests will appear in real-time once
              initiated.
            </div>
          ) : (
            <div className="space-y-3">
              {verificationQueue.map((verification) => (
                <div
                  key={verification.id}
                  className="rounded-2xl border border-white/10 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-textPrimary capitalize">
                        {verification.relatedEntityType} {verification.relatedEntityId}
                      </p>
                      <p className="mt-1 text-xs text-textSecondary">
                        Scope: {verification.scope.join(', ')}
                      </p>
                    </div>
                    <VerificationStatusPill status={verification.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wide text-textSecondary">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Started {formatRelative(verification.initiatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Updated {formatRelative(verification.lastUpdatedAt)}
                    </span>
                    {verification.expiresAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                        Expires {formatTimestamp(verification.expiresAt)}
                      </span>
                    ) : null}
                    {verification.reviewerUserId ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                        Reviewer {verification.reviewerUserId}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.auditError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/60 p-4 text-red-200">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <div>
              <p className="text-sm font-medium">Unable to load audit trail</p>
              <p className="text-xs opacity-80">{data.auditError}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-textSecondary">
              Audit Trail
            </h3>
            <span className="text-[0.65rem] uppercase text-textSecondary">
              {auditFeed.length} recent events
            </span>
          </div>
          {auditFeed.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-background/60 p-4 text-sm text-textSecondary">
              No audit events captured yet. System and user actions will appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {auditFeed.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-background/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{event.eventType}</p>
                      <p className="mt-1 text-xs text-textSecondary/80">{event.description}</p>
                    </div>
                    <span className="text-[0.65rem] uppercase text-textSecondary">
                      {formatTimestamp(event.occurredAt)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-wide text-textSecondary">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Severity {event.severity}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Actor {event.actorLabel ?? event.actorId ?? event.actorType}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-background/40 px-2 py-0.5">
                      Source {event.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.summary?.financialStatuses.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wide text-textSecondary">
                Financial & Platform Compliance
              </h3>
              <span className="text-[0.65rem] uppercase text-textSecondary">
                {data.summary.financialStatuses.length} surfaces monitored
              </span>
            </div>
            <div className="space-y-3">
              {data.summary.financialStatuses.map((status) => (
                <FinancialStatusCard key={status.id} status={status} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const ComplianceTimeline = ComplianceDashboard;
