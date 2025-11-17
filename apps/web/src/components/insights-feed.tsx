import { Lightbulb, Radar } from 'lucide-react';

const insights = [
  {
    title: 'AI arbitrage signal triggered',
    detail: 'Shadow Daggers | Fade gap widened 3.4% between Buff and PopFlash OTC desks.',
    action: 'Route via escrow to capture spread',
    icon: Radar,
  },
  {
    title: 'Portfolio correlation stress test',
    detail: 'Knife-heavy baskets overexposed to pattern-based volatility. Suggest trimming 6%.',
    action: 'Rebalance before Major qualifier cycle',
    icon: Lightbulb,
  },
];

export const InsightsFeed = () => (
  <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
    <h2 className="text-2xl font-heading font-semibold">Alpha Feed</h2>
    <p className="text-sm text-textSecondary">
      AI-generated insights synthesizing market microstructure, KYC signals, and escrow telemetry
    </p>
    <div className="mt-6 space-y-4">
      {insights.map((insight) => {
        const Icon = insight.icon;
        return (
          <article
            key={insight.title}
            className="rounded-2xl border border-white/5 bg-background/70 p-4"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-textPrimary">{insight.title}</h3>
            </div>
            <p className="mt-2 text-sm text-textSecondary">{insight.detail}</p>
            <p className="mt-3 text-xs text-primary">{insight.action}</p>
          </article>
        );
      })}
    </div>
  </section>
);