import type { Insight, InsightStatus } from '@popflash/shared';
import { insightSchema } from '@popflash/shared';

import { env } from '../config/env.js';
import {
  findAssetsByIds,
  findPortfolioByUserId,
  listOpenEscrowsForUser,
  listRecentTradesForUser,
} from '../repositories/context-repository.js';
import {
  createInsights,
  listInsights,
  updateInsightStatus,
  type InsightDraft,
  type ListInsightsFilters,
} from '../repositories/insight-repository.js';
import { buildInsightsFromContext } from './generation-service.js';

interface GenerateInsightsInput {
  userId: string;
  scope?: Array<'portfolio' | 'trades' | 'escrow'>;
  tags?: string[];
  channels?: Insight['channels'];
  force?: boolean;
}

export const fetchInsights = async (filters: ListInsightsFilters) => {
  const results = await listInsights(filters);
  return results.map(normalizeInsightRecord);
};

export const generateInsightsForUser = async (input: GenerateInsightsInput) => {
  const now = new Date();
  const lookbackMs = env.generationLookbackDays * 24 * 60 * 60 * 1000;
  const since = new Date(now.getTime() - lookbackMs);

  const [portfolio, trades, escrows] = await Promise.all([
    input.scope?.includes('portfolio') ?? true ? findPortfolioByUserId(input.userId) : Promise.resolve(null),
    input.scope?.includes('trades') ?? true
      ? listRecentTradesForUser(input.userId, since, env.maxRecentTrades)
      : Promise.resolve([]),
    input.scope?.includes('escrow') ?? true ? listOpenEscrowsForUser(input.userId) : Promise.resolve([]),
  ]);

  const assetIds = new Set<string>();

  if (portfolio?.holdings) {
    for (const holding of portfolio.holdings) {
      assetIds.add(holding.assetId);
    }
  }

  for (const trade of trades) {
    for (const asset of trade.assets) {
      assetIds.add(asset.assetId);
    }
  }

  const assets = await findAssetsByIds([...assetIds]);
  const assetMap = new Map<string, { name?: string | null; rarity?: string | null }>();

  for (const asset of assets) {
    assetMap.set(asset._id, { name: asset.name, rarity: asset.rarity });
  }

  const context: Parameters<typeof buildInsightsFromContext>[0] = {
    userId: input.userId,
    portfolio,
    trades,
    escrows,
    assetMap,
    lookbackDays: env.generationLookbackDays,
    now,
  };

  let drafts = buildInsightsFromContext(context);

  if (drafts.length === 0 && input.force) {
    drafts = [createBaselineInsight(context)];
  }

  const enhancedDrafts = drafts.map((draft) => ({
    ...draft,
    channels: input.channels ?? draft.channels ?? ['in_app'],
    tags: input.tags ? Array.from(new Set([...(draft.tags ?? []), ...input.tags])) : draft.tags,
  }));

  if (enhancedDrafts.length === 0) {
    return [];
  }

  const created = await createInsights(enhancedDrafts);
  return created.map((doc) => {
    const record = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    return normalizeInsightRecord(record as Record<string, unknown>);
  });
};

export const setInsightStatus = async (id: string, status: InsightStatus) => {
  const updated = await updateInsightStatus(id, status);

  if (!updated) {
    return null;
  }

  return normalizeInsightRecord(updated);
};

const normalizeInsightRecord = (record: Record<string, unknown>): Insight => {
  const id = (record.id as string | undefined) ?? (record._id as string | undefined);

  if (!id) {
    throw new Error('Insight record missing identifier');
  }

  return insightSchema.parse({
    ...record,
    id,
  });
};

const extractId = (record?: { id?: string; _id?: string | { toString(): string } }) => {
  if (!record) {
    return undefined;
  }

  if (record.id) {
    return record.id;
  }

  if (typeof record._id === 'string') {
    return record._id;
  }

  if (record._id && typeof record._id.toString === 'function') {
    return record._id.toString();
  }

  return undefined;
};

const createBaselineInsight = (context: Parameters<typeof buildInsightsFromContext>[0]): InsightDraft => ({
  userId: context.userId,
  headline: `Systems check: no anomalies detected (${context.lookbackDays}d lookback)`,
  detail: 'Insight engine found no risk or operational alerts. Maintaining monitoring cadence.',
  narrative:
    'Portfolio, escrow, and trade telemetry all sit within nominal guardrails. Continue scanning for arbitrage spreads and review compliance posture ahead of major events.',
  sentiment: 'neutral',
  impact: 'operations',
  confidence: 0.4,
  priority: 'low',
  recommendedActions: [
    'Run scheduled compliance reconciliation to keep desk audit-ready',
    'Refresh market scanners to capture new arbitrage spreads',
  ],
  supportingMetrics: [
    { label: 'Lookback (days)', value: `${context.lookbackDays}` },
    { label: 'Tracked trades', value: `${context.trades.length}` },
    { label: 'Open escrows', value: `${context.escrows.length}` },
  ],
  tags: ['operations', 'telemetry'],
  channels: ['in_app'],
  references: [{ type: 'portfolio', id: extractId(context.portfolio) }],
  metadata: {
    baseline: true,
  },
});