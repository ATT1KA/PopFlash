const riskSignals = [
  {
    label: 'Counterparty risk score',
    value: 'Low',
    detail: 'All active escrows cleared Persona + SteamGuard heuristics.',
  },
  {
    label: 'AML alerts (24h)',
    value: '0',
    detail: 'OFAC & EU screening cleared for current settlement queue.',
  },
  {
    label: 'Tax exposure forecast',
    value: '$6,240',
    detail: 'Based on accrued 7.25% tax across completed trades.',
  },
];

export const RiskIndicators = () => (
  <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
    <h2 className="text-xl font-heading font-semibold">Risk & Compliance</h2>
    <div className="mt-5 space-y-4">
      {riskSignals.map((signal) => (
        <article key={signal.label} className="rounded-2xl border border-white/5 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-wide text-textSecondary">{signal.label}</p>
          <p className="mt-1 text-lg font-semibold text-primary">{signal.value}</p>
          <p className="text-xs text-textSecondary/80">{signal.detail}</p>
        </article>
      ))}
    </div>
  </section>
);