const performance = [
  { label: 'Net Asset Value', value: '$248,650', delta: '+12.4%' },
  { label: 'Escrow Exposure', value: '$32,400', delta: '+2 pending' },
  { label: 'Steam Inventory Sync', value: '98.6%', delta: 'Latency 220ms' },
];

const allocations = [
  { segment: 'Rifles', weight: 42 },
  { segment: 'Knives', weight: 28 },
  { segment: 'Pistols', weight: 13 },
  { segment: 'Stickers & Patches', weight: 9 },
  { segment: 'Cases', weight: 8 },
];

export const PortfolioPerformance = () => {
  return (
    <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
      <h2 className="text-xl font-heading font-semibold">Portfolio Control Center</h2>
      <div className="mt-5 space-y-4">
        {performance.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-textSecondary">{metric.label}</p>
              <p className="text-lg font-semibold text-textPrimary">{metric.value}</p>
            </div>
            <p className="text-xs text-primary">{metric.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-textSecondary">Allocation Mix</p>
        <div className="mt-3 space-y-3">
          {allocations.map((allocation) => (
            <div key={allocation.segment}>
              <div className="flex items-center justify-between text-sm text-textSecondary">
                <span>{allocation.segment}</span>
                <span>{allocation.weight}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${allocation.weight}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};