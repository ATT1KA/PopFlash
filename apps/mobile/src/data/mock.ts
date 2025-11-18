import type { TradeStatus } from '@popflash/shared';

export const portfolioSummary = {
  totalValue: 48250.75,
  dailyChange: 4.2,
  weeklyChange: 12.4,
};

export const topAssets = [
  {
    id: 'ak-emerald-pinstripe',
    name: 'AK-47 | Emerald Pinstripe',
    value: 12650,
    change: 6.1,
  },
  {
    id: 'karambit-lore',
    name: 'Karambit | Lore (Factory New)',
    value: 9800,
    change: 8.4,
  },
  {
    id: 'm4a1-printstream',
    name: 'M4A1-S | Printstream',
    value: 7450,
    change: -1.2,
  },
];

export const tradePipeline: Array<{
  id: string;
  counterparty: string;
  status: TradeStatus;
  value: number;
  updatedAt: string;
}> = [
  {
    id: 'trade-1876',
    counterparty: 'AuroraCollective',
    status: 'awaiting_payment',
    value: 3250,
    updatedAt: '2025-11-17T08:32:00Z',
  },
  {
    id: 'trade-1875',
    counterparty: 'MirageVault',
    status: 'under_review',
    value: 11400,
    updatedAt: '2025-11-17T04:12:00Z',
  },
  {
    id: 'trade-1874',
    counterparty: 'InfernoSyndicate',
    status: 'settled',
    value: 8720,
    updatedAt: '2025-11-16T22:45:00Z',
  },
];

export const complianceTimeline = [
  {
    id: 'kyc-refresh',
    title: 'KYC Refresh Cycle',
    window: 'Due in 12 days',
    severity: 'moderate',
  },
  {
    id: 'escrow-audit',
    title: 'Escrow Ledger Audit',
    window: 'Scheduled for Nov 25',
    severity: 'high',
  },
  {
    id: 'fintrac-reporting',
    title: 'FINTRAC SAR Submission',
    window: 'Completed Nov 09',
    severity: 'low',
  },
];

export const insightsFeed = [
  {
    id: 'alpha-1',
    headline: 'Glove Inventory Premium Expanding',
    detail:
      'Tier-1 glove skins are trading 6.4% above trailing 60-day average amid Paris Major hype.',
    sentiment: 'bullish',
  },
  {
    id: 'alpha-2',
    headline: 'Escrow Velocity Trending Up',
    detail: 'Time-to-settle dropped to 6.8 hours with the latest automation release.',
    sentiment: 'neutral',
  },
  {
    id: 'alpha-3',
    headline: 'Emerging Counterparty Risk',
    detail:
      'Three new counterparties flagged for aggressive undercuts. Consider tightening spread controls.',
    sentiment: 'bearish',
  },
];
