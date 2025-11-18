import type { TradeStatus } from '@popflash/shared';

type CounterpartyRole = 'buyer' | 'seller' | 'escrow';
type CounterpartyRiskLevel = 'low' | 'moderate' | 'high' | 'internal';
type InsightImpactArea = 'portfolio' | 'operations' | 'risk';

export interface TradeDetailAsset {
  id: string;
  name: string;
  priceUsd: number;
  wear: string;
  category: string;
}

export interface TradeMilestone {
  id: string;
  label: string;
  completed: boolean;
  timestamp: string | null;
}

export interface TradeAuditEntry {
  timestamp: string;
  actor: string;
  note: string;
}

export interface TradeDetail {
  id: string;
  counterparty: string;
  status: TradeStatus;
  value: number;
  updatedAt: string;
  direction: 'buy' | 'sell';
  settlementEta: string;
  counterparties: Array<{
    name: string;
    role: CounterpartyRole;
    riskRating: CounterpartyRiskLevel;
  }>;
  assets: TradeDetailAsset[];
  milestones: TradeMilestone[];
  auditTrail: TradeAuditEntry[];
  notes: string;
}

export interface AssetDetail {
  id: string;
  name: string;
  category: string;
  rarity: string;
  collection: string;
  description: string;
  analystTake: string;
  priceUsd: number;
  change: number;
  floatRange: string;
  volume24h: number;
  holdings: Array<{
    location: string;
    quantity: number;
    share: number;
  }>;
  metrics: Array<{ label: string; value: string }>;
  comparableSales: Array<{
    id: string;
    counterparty: string;
    priceUsd: number;
    timestamp: string;
  }>;
  tags: string[];
  riskFlags: string[];
}

export interface InsightDetail {
  id: string;
  headline: string;
  detail: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  impact: InsightImpactArea;
  triggeredAt: string;
  confidence: number;
  recommendedActions: string[];
  supportingMetrics: Array<{ label: string; value: string; delta?: string }>;
  narrative: string;
}

export const portfolioSummary = {
  totalValue: 48250.75,
  dailyChange: 4.2,
  weeklyChange: 12.4,
};

export const portfolioAllocation = [
  { label: 'Knives', weight: 0.32 },
  { label: 'Rifles', weight: 0.28 },
  { label: 'Gloves', weight: 0.18 },
  { label: 'Pistols', weight: 0.12 },
  { label: 'Collectibles', weight: 0.1 },
];

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

const tradeDetails: Record<string, TradeDetail> = {
  'trade-1876': {
    id: 'trade-1876',
    counterparty: 'AuroraCollective',
    status: 'awaiting_payment',
    value: 3250,
    updatedAt: '2025-11-17T08:32:00Z',
    direction: 'buy',
    settlementEta: '4h 20m',
    counterparties: [
      { name: 'AuroraCollective', role: 'seller', riskRating: 'moderate' },
      { name: 'PopFlash Desk', role: 'buyer', riskRating: 'internal' },
    ],
    assets: [
      {
        id: 'ak-emerald-pinstripe',
        name: 'AK-47 | Emerald Pinstripe',
        priceUsd: 1780,
        wear: '0.07',
        category: 'Rifle',
      },
      {
        id: 'glove-superconductor',
        name: 'Specialist Gloves | Superconductor',
        priceUsd: 1470,
        wear: '0.15',
        category: 'Gloves',
      },
    ],
    milestones: [
      { id: 'init', label: 'Trade Initiated', completed: true, timestamp: '2025-11-16T23:48:00Z' },
      { id: 'escrow', label: 'Escrow Funded', completed: true, timestamp: '2025-11-17T08:12:00Z' },
      { id: 'verification', label: 'Asset Verification', completed: false, timestamp: null },
      { id: 'settlement', label: 'Settlement', completed: false, timestamp: null },
    ],
    auditTrail: [
      {
        timestamp: '2025-11-17T08:12:00Z',
        actor: 'Escrow Engine',
        note: 'Escrow hold confirmed from AuroraCollective wallet.',
      },
      {
        timestamp: '2025-11-17T08:32:00Z',
        actor: 'Risk Monitor',
        note: 'AML scan completed, no anomalies detected.',
      },
    ],
    notes:
      'Awaiting payment confirmation. Automated reminder scheduled if funds not confirmed within 2h.',
  },
  'trade-1875': {
    id: 'trade-1875',
    counterparty: 'MirageVault',
    status: 'under_review',
    value: 11400,
    updatedAt: '2025-11-17T04:12:00Z',
    direction: 'sell',
    settlementEta: 'Pending compliance',
    counterparties: [
      { name: 'PopFlash Desk', role: 'seller', riskRating: 'internal' },
      { name: 'MirageVault', role: 'buyer', riskRating: 'low' },
      { name: 'Persona Verify', role: 'escrow', riskRating: 'internal' },
    ],
    assets: [
      {
        id: 'karambit-lore',
        name: 'Karambit | Lore (Factory New)',
        priceUsd: 9800,
        wear: '0.02',
        category: 'Knife',
      },
      {
        id: 'sticker-boston-foil',
        name: 'Sticker | Legends (Boston) Foil',
        priceUsd: 1600,
        wear: 'N/A',
        category: 'Sticker',
      },
    ],
    milestones: [
      { id: 'init', label: 'Trade Initiated', completed: true, timestamp: '2025-11-16T18:04:00Z' },
      { id: 'compliance', label: 'Compliance Review', completed: false, timestamp: null },
      { id: 'escrow', label: 'Escrow Funding', completed: false, timestamp: null },
      { id: 'settlement', label: 'Settlement', completed: false, timestamp: null },
    ],
    auditTrail: [
      {
        timestamp: '2025-11-17T04:12:00Z',
        actor: 'Compliance Bot',
        note: 'Enhanced due diligence triggered for high notch premium differentials.',
      },
      {
        timestamp: '2025-11-17T04:25:00Z',
        actor: 'Risk Analyst',
        note: 'Manual review pending verification of provenance certificates.',
      },
    ],
    notes:
      'High-value knife transfer flagged due to external marketplace arbitrage. Persona verification pending.',
  },
  'trade-1874': {
    id: 'trade-1874',
    counterparty: 'InfernoSyndicate',
    status: 'settled',
    value: 8720,
    updatedAt: '2025-11-16T22:45:00Z',
    direction: 'buy',
    settlementEta: 'Completed',
    counterparties: [
      { name: 'InfernoSyndicate', role: 'seller', riskRating: 'moderate' },
      { name: 'PopFlash Desk', role: 'buyer', riskRating: 'internal' },
    ],
    assets: [
      {
        id: 'm4a1-printstream',
        name: 'M4A1-S | Printstream',
        priceUsd: 7450,
        wear: '0.05',
        category: 'Rifle',
      },
      {
        id: 'case-hardened-blue-gem',
        name: 'Five-SeveN | Case Hardened (Blue Gem)',
        priceUsd: 1270,
        wear: '0.18',
        category: 'Pistol',
      },
    ],
    milestones: [
      { id: 'init', label: 'Trade Initiated', completed: true, timestamp: '2025-11-16T11:21:00Z' },
      { id: 'escrow', label: 'Escrow Funded', completed: true, timestamp: '2025-11-16T11:32:00Z' },
      {
        id: 'verification',
        label: 'Asset Verification',
        completed: true,
        timestamp: '2025-11-16T16:04:00Z',
      },
      { id: 'settlement', label: 'Settlement', completed: true, timestamp: '2025-11-16T22:45:00Z' },
    ],
    auditTrail: [
      {
        timestamp: '2025-11-16T22:45:00Z',
        actor: 'Escrow Engine',
        note: 'Settlement completed and funds released to InfernoSyndicate.',
      },
      {
        timestamp: '2025-11-16T22:46:00Z',
        actor: 'Ledger Bot',
        note: 'Trade archived with settlement hash #9f2a1d.',
      },
    ],
    notes:
      'Trade closed successfully. Counterparty qualifies for preferred desk tier upgrade review.',
  },
};

const assetDetails: Record<string, AssetDetail> = {
  'ak-emerald-pinstripe': {
    id: 'ak-emerald-pinstripe',
    name: 'AK-47 | Emerald Pinstripe',
    category: 'Rifle',
    rarity: 'Classified',
    collection: 'CS:GO Weapon Case 2',
    description:
      'High-velocity rifle skin prized for its saturated emerald patterning and limited drop table availability.',
    analystTake:
      'Momentum remains intact with record liquidity on tier-1 desks. Maintain overweight exposure while trimming into spikes above 13k.',
    priceUsd: 12650,
    change: 6.1,
    floatRange: '0.00 — 0.08',
    volume24h: 14,
    holdings: [
      { location: 'Active Vault', quantity: 7, share: 0.58 },
      { location: 'Escrow Commitments', quantity: 3, share: 0.25 },
      { location: 'Marketplace Listings', quantity: 2, share: 0.17 },
    ],
    metrics: [
      { label: '30d Volatility', value: '2.8%' },
      { label: 'Liquidity Score', value: '89 / 100' },
      { label: 'Counterparty Score', value: 'AA-' },
    ],
    comparableSales: [
      {
        id: 'comp-001',
        counterparty: 'MirageVault',
        priceUsd: 12480,
        timestamp: '2025-11-16T18:12:00Z',
      },
      {
        id: 'comp-002',
        counterparty: 'AuroraCollective',
        priceUsd: 12540,
        timestamp: '2025-11-15T09:32:00Z',
      },
    ],
    tags: ['Momentum', 'High Liquidity', 'Major Event Beta'],
    riskFlags: ['Manual wear verification recommended before release.'],
  },
  'karambit-lore': {
    id: 'karambit-lore',
    name: 'Karambit | Lore (Factory New)',
    category: 'Knife',
    rarity: 'Covert',
    collection: 'Gamma Case',
    description:
      'Iconic covert-tier knife with high collector demand and limited inventory circulation.',
    analystTake:
      'Short-term supply squeeze observed across European desks. Consider laddering exits but retain a strategic position for Paris playoff speculation.',
    priceUsd: 9800,
    change: 8.4,
    floatRange: '0.00 — 0.03',
    volume24h: 6,
    holdings: [
      { location: 'Active Vault', quantity: 4, share: 0.5 },
      { location: 'Escrow Commitments', quantity: 2, share: 0.25 },
      { location: 'Trading Desk', quantity: 2, share: 0.25 },
    ],
    metrics: [
      { label: 'Bid / Ask Spread', value: '3.4%' },
      { label: 'Desk Utilization', value: '74%' },
      { label: 'Counterparty Score', value: 'A' },
    ],
    comparableSales: [
      {
        id: 'comp-101',
        counterparty: 'Icebox Holdings',
        priceUsd: 9650,
        timestamp: '2025-11-16T14:52:00Z',
      },
      {
        id: 'comp-102',
        counterparty: 'NukeCollective',
        priceUsd: 9725,
        timestamp: '2025-11-15T21:07:00Z',
      },
    ],
    tags: ['High Value', 'Collector Demand'],
    riskFlags: ['Spread widening if Persona onboarding lags.'],
  },
  'm4a1-printstream': {
    id: 'm4a1-printstream',
    name: 'M4A1-S | Printstream',
    category: 'Rifle',
    rarity: 'Covert',
    collection: 'Operation Broken Fang',
    description: 'Sought-after covert rifle with pearlescent finish and strong esports visibility.',
    analystTake:
      'Price softness driven by supply rotation post-major. Attractive re-entry candidate with solid desk turnover.',
    priceUsd: 7450,
    change: -1.2,
    floatRange: '0.02 — 0.12',
    volume24h: 11,
    holdings: [
      { location: 'Active Vault', quantity: 5, share: 0.45 },
      { location: 'Marketplace Listings', quantity: 4, share: 0.36 },
      { location: 'Lending Pool', quantity: 2, share: 0.19 },
    ],
    metrics: [
      { label: '30d Volatility', value: '3.6%' },
      { label: 'Liquidity Score', value: '81 / 100' },
      { label: 'Desk Utilization', value: '67%' },
    ],
    comparableSales: [
      {
        id: 'comp-201',
        counterparty: 'InfernoSyndicate',
        priceUsd: 7380,
        timestamp: '2025-11-16T20:45:00Z',
      },
      {
        id: 'comp-202',
        counterparty: 'Cache Capital',
        priceUsd: 7445,
        timestamp: '2025-11-15T15:18:00Z',
      },
    ],
    tags: ['Desk Favorite', 'High Turnover'],
    riskFlags: ['Monitor float premiums; buyers sensitive above 0.10 wear.'],
  },
};

const insightDetails: Record<string, InsightDetail> = {
  'alpha-1': {
    id: 'alpha-1',
    headline: 'Glove Inventory Premium Expanding',
    detail:
      'Tier-1 glove skins are trading 6.4% above trailing 60-day average amid Paris Major hype.',
    sentiment: 'bullish',
    impact: 'portfolio',
    triggeredAt: '2025-11-17T06:30:00Z',
    confidence: 0.78,
    recommendedActions: [
      'Deploy targeted offers to glove-focused counterparties while spreads remain favorable.',
      'Rotate mid-tier inventory into spotlight listings to capture event premium.',
    ],
    supportingMetrics: [
      { label: 'Premium vs 30d Avg', value: '+6.4%', delta: '+1.2pp WoW' },
      { label: 'Liquidity Index', value: '92 / 100' },
      { label: 'Escrow Utilization', value: '84%' },
    ],
    narrative:
      'Paris playoff speculation is creating sustained buy-side depth across tier-1 glove lines. Desk positioning remains constructive with capacity to absorb additional flow.',
  },
  'alpha-2': {
    id: 'alpha-2',
    headline: 'Escrow Velocity Trending Up',
    detail: 'Time-to-settle dropped to 6.8 hours with the latest automation release.',
    sentiment: 'neutral',
    impact: 'operations',
    triggeredAt: '2025-11-17T05:00:00Z',
    confidence: 0.64,
    recommendedActions: [
      'Expand automation playbook to high-value trades currently in manual queue.',
      'Instrument production alerting around velocity dips below 5.5h to maintain SLA buffer.',
    ],
    supportingMetrics: [
      { label: 'Avg Settlement Time', value: '6.8h', delta: '-0.9h WoW' },
      { label: 'Automation Coverage', value: '71%' },
      { label: 'Counterparty SLA Compliance', value: '96%' },
    ],
    narrative:
      'Automation rollout is compounding settlement efficiency. Additional investment could unlock sub-6h settlement targets while keeping risk thresholds intact.',
  },
  'alpha-3': {
    id: 'alpha-3',
    headline: 'Emerging Counterparty Risk',
    detail:
      'Three new counterparties flagged for aggressive undercuts. Consider tightening spread controls.',
    sentiment: 'bearish',
    impact: 'risk',
    triggeredAt: '2025-11-16T22:18:00Z',
    confidence: 0.82,
    recommendedActions: [
      'Escalate monitoring thresholds for undercutting behavior within the next 48 hours.',
      'Route new counterparties through enhanced KYC verification prior to settlement.',
    ],
    supportingMetrics: [
      { label: 'Flagged Counterparties', value: '3', delta: '+2 vs prior day' },
      { label: 'Spread Compression', value: '-1.8pp', delta: '-0.6pp WoW' },
      { label: 'Persona Tier Compliance', value: '68%' },
    ],
    narrative:
      'Aggressive undercutting behavior is emerging as mid-tier desks chase liquidity. Tightening spread guards and reinforcing onboarding controls is recommended until pressure normalizes.',
  },
};

export const getTradeDetail = (id: string) => tradeDetails[id];
export const getAssetDetail = (id: string) => assetDetails[id];
export const getInsightDetail = (id: string) => insightDetails[id];
