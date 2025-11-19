import type { Insight } from '@popflash/shared';
import { AlertTriangle, Lightbulb, Radar, Shield } from 'lucide-react';
import { unstable_noStore as noStore } from 'next/cache';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_GATEWAY_URL ?? 'http://localhost:4000';

const impactIconMap = {
  portfolio: Lightbulb,
  operations: Radar,
  risk: Shield,
} as const satisfies Record<Insight['impact'], typeof Lightbulb>;

async function fetchInsights(): Promise<Insight[]> {
  noStore();

  const response = await fetch(`${API_BASE_URL}/v1/insights?limit=5`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load insights: ${response.statusText}`);
  }

  const payload = (await response.json()) as { insights: Insight[] };
  return payload.insights;
}

const formatAction = (insight: Insight) =>
  insight.recommendedActions?.[0] ?? 'Review recommended workflow in detail view';

const formatTimestamp = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(value);

export const InsightsFeed = async () => {
  let insights: Insight[] = [];
  let error: string | null = null;

  try {
    insights = await fetchInsights();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error fetching insights';
  }

  return (
    <section className="rounded-3xl border border-white/5 bg-panel/70 p-6 shadow-card">
      <h2 className="text-2xl font-heading font-semibold">Alpha Feed</h2>
      <p className="text-sm text-textSecondary">
        AI-generated insights synthesizing market microstructure, KYC signals, and escrow telemetry
      </p>
      <div className="mt-6 space-y-4">
        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/60 p-4 text-red-200">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">Unable to load live insights</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-background/70 p-4 text-sm text-textSecondary">
            No insights yet—fresh AI signals will appear here the moment they are generated.
          </div>
        ) : (
          insights.map((insight) => {
            const Icon = impactIconMap[insight.impact] ?? Lightbulb;
            return (
              <article
                key={insight.id}
                className="rounded-2xl border border-white/5 bg-background/70 p-4 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium text-textPrimary">{insight.headline}</h3>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-textSecondary">
                    {insight.priority} • {formatTimestamp(new Date(insight.generatedAt))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-textSecondary">{insight.detail}</p>
                <p className="mt-3 text-xs text-primary">{formatAction(insight)}</p>
                {insight.tags?.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-textSecondary">
                    {insight.tags.map((tag) => (
                      <li key={tag} className="rounded-full border border-white/10 px-2 py-1">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
