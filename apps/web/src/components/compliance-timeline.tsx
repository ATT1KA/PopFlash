const timeline = [
  {
    phase: 'Persona Verification',
    status: 'Complete',
    timestamp: '13:14 UTC',
    detail: 'Dual-factor KYC cleared for escrow TRD-48211.',
  },
  {
    phase: 'Steam API Sync',
    status: 'Complete',
    timestamp: '13:11 UTC',
    detail: 'Inventory snapshot reconciled with PopFlash holdings.',
  },
  {
    phase: 'Escrow Funding',
    status: 'In Progress',
    timestamp: '13:08 UTC',
    detail: 'ACH transfer awaiting bank confirmation (ETA 7m).',
  },
];

export const ComplianceTimeline = () => (
  <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
    <h2 className="text-xl font-heading font-semibold">Escrow Timeline</h2>
    <div className="mt-5 space-y-5">
      {timeline.map((entry, index) => (
        <div key={entry.phase} className="relative pl-6">
          <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" />
          {index < timeline.length - 1 && (
            <span className="absolute left-[3px] top-3 h-full w-px bg-white/10" aria-hidden />
          )}
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-textPrimary">{entry.phase}</p>
            <p className="text-xs text-textSecondary">{entry.timestamp}</p>
          </div>
          <p className="text-xs text-primary">{entry.status}</p>
          <p className="mt-1 text-xs text-textSecondary/80">{entry.detail}</p>
        </div>
      ))}
    </div>
  </section>
);
