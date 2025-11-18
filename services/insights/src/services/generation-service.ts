import type { InsightImpactArea, InsightPriority, InsightSentiment } from '@popflash/shared';

import type {
  EscrowRecord,
  PortfolioRecord,
  TradeRecord,
} from '../repositories/context-repository.js';
import type { InsightDraft } from '../repositories/insight-repository.js';

interface GenerationContext {
  userId: string;
  portfolio?: PortfolioRecord | null;
  trades: TradeRecord[];
  escrows: EscrowRecord[];
  assetMap: Map<string, { name?: string | null; rarity?: string | null }>;
  lookbackDays: number;
  now: Date;
}

const MAX_INSIGHTS = 5;

export const buildInsightsFromContext = (context: GenerationContext): InsightDraft[] => {
  const insights: InsightDraft[] = [];

  insights.push(...generatePortfolioConcentrationInsight(context));
  insights.push(...generateEscrowStallInsight(context));
  insights.push(...generateSettlementAttentionInsight(context));
  insights.push(...generateVelocityInsight(context));
  insights.push(...generateDormantTradingInsight(context));

  return insights.slice(0, MAX_INSIGHTS);
};

const formatUsd = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

const percent = (part: number, whole: number) => (whole === 0 ? 0 : (part / whole) * 100);

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

const generatePortfolioConcentrationInsight = (context: GenerationContext): InsightDraft[] => {
  const portfolio = context.portfolio;

  if (!portfolio || portfolio.holdings.length === 0 || portfolio.totalValueUsd <= 0) {
    return [];
  }

  const holdings = [...portfolio.holdings].sort((a, b) => b.valueUsd - a.valueUsd);
  const topHolding = holdings[0];
  const share = percent(topHolding.valueUsd, portfolio.totalValueUsd);

  if (share < 35) {
    return [];
  }

  const asset = context.assetMap.get(topHolding.assetId);

  return [
    {
      userId: context.userId,
      assetId: topHolding.assetId,
      headline: `${asset?.name ?? 'Top holding'} concentration at ${share.toFixed(1)}%`,
      detail: `Your leading position accounts for ${share.toFixed(1)}% of portfolio value, signalling concentration risk if market volatility spikes.`,
      narrative: `Holdings analysis over the last ${context.lookbackDays} days shows one asset dominating exposure. Consider trimming or hedging to keep any single position below 30% of total net asset value.`,
      sentiment: sentimentFromShare(share),
      impact: 'portfolio',
      confidence: Math.min(0.95, 0.55 + share / 100),
      priority: share >= 50 ? 'high' : 'medium',
      recommendedActions: [
        'Rebalance by routing part of the position through escrow-backed trades',
        'Deploy proceeds into lower correlation assets to spread risk',
      ],
      supportingMetrics: [
        { label: 'Top holding value', value: formatUsd(topHolding.valueUsd) },
        { label: 'Portfolio value', value: formatUsd(portfolio.totalValueUsd) },
        { label: 'Concentration share', value: `${share.toFixed(1)}%` },
      ],
      tags: ['portfolio', 'concentration', 'risk'],
      channels: ['in_app'],
      references: [
        { type: 'portfolio', id: extractId(portfolio) },
        { type: 'asset', id: topHolding.assetId },
      ],
      metadata: {
        holdingsTracked: portfolio.holdings.length,
        concentrationShare: share,
      },
    },
  ];
};

const sentimentFromShare = (share: number): InsightSentiment => {
  if (share >= 60) {
    return 'bearish';
  }

  if (share >= 45) {
    return 'neutral';
  }

  return 'bullish';
};

const generateEscrowStallInsight = (context: GenerationContext): InsightDraft[] => {
  if (context.escrows.length === 0) {
    return [];
  }

  const staleEscrows = context.escrows
    .map((escrow) => ({
      escrow,
      hoursOpen: (context.now.getTime() - new Date(escrow.createdAt).getTime()) / 3_600_000,
    }))
    .filter(({ hoursOpen, escrow }) => hoursOpen >= 48 && escrow.status !== 'settled');

  if (staleEscrows.length === 0) {
    return [];
  }

  const worst = staleEscrows.sort((a, b) => b.hoursOpen - a.hoursOpen)[0];

  return [
    {
      userId: context.userId,
      tradeId: worst.escrow.tradeId,
      headline: `Escrow ${worst.escrow.tradeId} stalled at ${formatStatus(worst.escrow.status)}`,
      detail: `Escrow flow has been open for ${worst.hoursOpen.toFixed(0)} hours without settlement. Counterparty funds remain locked increasing counterparty risk.`,
      narrative: `Escrow telemetry shows process drift beyond the 48 hour SLA. Recommend escalating with the counterparty and verifying milestone completion to avoid disputes.`,
      sentiment: 'bearish',
      impact: 'risk',
      confidence: 0.68,
      priority: 'high',
      recommendedActions: [
        'Trigger escalation workflow with compliance desk',
        'Request updated proof-of-delivery artifacts within the escrow portal',
      ],
      supportingMetrics: [
        { label: 'Hours open', value: worst.hoursOpen.toFixed(0) },
        { label: 'Escrow status', value: formatStatus(worst.escrow.status) },
      ],
      tags: ['escrow', 'operations', 'risk'],
      channels: ['in_app', 'email'],
      references: [
        { type: 'trade', id: worst.escrow.tradeId },
        { type: 'counterparty', id: worst.escrow.buyerUserId === context.userId ? worst.escrow.sellerUserId : worst.escrow.buyerUserId },
      ],
      metadata: {
        escrowId: extractId(worst.escrow),
        hoursOpen: worst.hoursOpen,
      },
    },
  ];
};

const generateSettlementAttentionInsight = (context: GenerationContext): InsightDraft[] => {
  const flaggedTrades = context.trades
    .map((trade) => ({
      trade,
      hoursSinceUpdate: (context.now.getTime() - new Date(trade.updatedAt).getTime()) / 3_600_000,
    }))
    .filter(({ trade, hoursSinceUpdate }) =>
      ['under_review', 'settlement_pending', 'assets_in_escrow'].includes(trade.status) && hoursSinceUpdate >= 12,
    );

  if (flaggedTrades.length === 0) {
    return [];
  }

  const pending = flaggedTrades.sort((a, b) => b.hoursSinceUpdate - a.hoursSinceUpdate)[0];

  const impact: InsightImpactArea = pending.trade.status === 'under_review' ? 'risk' : 'operations';
  const priority: InsightPriority = pending.hoursSinceUpdate >= 24 ? 'high' : 'medium';
  const sentiment: InsightSentiment = pending.trade.status === 'under_review' ? 'bearish' : 'neutral';

  return [
    {
      userId: context.userId,
      tradeId: pending.trade.id ?? extractId(pending.trade),
      headline: `Trade ${pending.trade.id ?? extractId(pending.trade)} requires settlement attention`,
      detail: `Status ${formatStatus(pending.trade.status)} has not progressed for ${pending.hoursSinceUpdate.toFixed(0)} hours.`,
      narrative: `Monitoring flagged the trade as idle past operational guardrails. Coordinating with escrow and compliance will reduce dispute probability.`,
      sentiment,
      impact,
      confidence: 0.7,
      priority,
      recommendedActions: [
        'Ping escrow counterpart for milestone confirmation',
        'Capture chat transcript to audit log in case dispute escalates',
      ],
      supportingMetrics: [
        { label: 'Status age (hours)', value: pending.hoursSinceUpdate.toFixed(0) },
        { label: 'Trade status', value: formatStatus(pending.trade.status) },
      ],
      tags: ['trading', 'settlement'],
      channels: ['in_app'],
      references: [
        { type: 'trade', id: pending.trade.id ?? extractId(pending.trade) },
      ],
      metadata: {
        tradeStatus: pending.trade.status,
        hoursIdle: pending.hoursSinceUpdate,
      },
    },
  ];
};

const generateVelocityInsight = (context: GenerationContext): InsightDraft[] => {
  const tradeCount = context.trades.length;

  if (tradeCount < 5) {
    return [];
  }

  const totalVolume = context.trades.reduce((acc, trade) => acc + trade.totalUsd, 0);
  const avgTicket = totalVolume / tradeCount;

  return [
    {
      userId: context.userId,
      headline: `High-frequency desk activity detected (${tradeCount} trades)`,
      detail: `Desk executed ${tradeCount} trades over the last ${context.lookbackDays} days with ${formatUsd(totalVolume)} in notional flow.`,
      narrative: `Velocity models indicate elevated throughput. Ensure funding lines and escrow coverage remain aligned with spike-level activity.`,
      sentiment: 'bullish',
      impact: 'operations',
      confidence: 0.64,
      priority: tradeCount >= 12 ? 'medium' : 'low',
      recommendedActions: [
        'Review settlement capacity and Steam API rate limits',
        'Enable automated hedging rules for overnight sessions',
      ],
      supportingMetrics: [
        { label: 'Trades (lookback)', value: `${tradeCount}` },
        { label: 'Total flow', value: formatUsd(totalVolume) },
        { label: 'Average ticket', value: formatUsd(avgTicket) },
      ],
      tags: ['operations', 'velocity'],
      channels: ['in_app'],
      references: [{ type: 'portfolio', id: extractId(context.portfolio) }],
      metadata: {
        tradeCount,
        totalVolume,
        averageTicket: avgTicket,
      },
    },
  ];
};

const generateDormantTradingInsight = (context: GenerationContext): InsightDraft[] => {
  if (context.trades.length > 0) {
    return [];
  }

  return [
    {
      userId: context.userId,
      headline: 'Desk trading idle during insight window',
      detail: `No trades recorded in the last ${context.lookbackDays} days. Portfolio is fully idle against market signals.`,
      narrative: `Dormant activity windows reduce modelling accuracy. Consider priming a scouting trade or enabling automated arbitrage triggers to keep telemetry fresh.`,
      sentiment: 'neutral',
      impact: 'operations',
      confidence: 0.55,
      priority: 'medium',
      recommendedActions: [
        'Launch small calibration trade to refresh sentiment data',
        'Run Steam market scan to surface arbitrage spreads',
      ],
      supportingMetrics: [
        { label: 'Lookback window (days)', value: `${context.lookbackDays}` },
        { label: 'Escrows in-flight', value: `${context.escrows.length}` },
      ],
      tags: ['operations', 'insights'],
      channels: ['in_app'],
      references: [{ type: 'portfolio', id: extractId(context.portfolio) }],
      metadata: {
        lookbackDays: context.lookbackDays,
      },
    },
  ];
};

const formatStatus = (status: string) => status.replace(/_/g, ' ');

export type { GenerationContext };