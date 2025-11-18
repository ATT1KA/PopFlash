import { describe, expect, it } from 'vitest';

import { buildInsightsFromContext } from '../generation-service.js';

const baseContext = {
  userId: '2c4b9c2e-0f3c-4d6d-8edc-4d084d8851f0',
  portfolio: {
    id: 'c3acb8de-415d-4930-b36b-09dd572b2944',
    userId: '2c4b9c2e-0f3c-4d6d-8edc-4d084d8851f0',
    totalValueUsd: 50_000,
    holdings: [
      { assetId: 'asset-1', quantity: 10, valueUsd: 22_000 },
      { assetId: 'asset-2', quantity: 4, valueUsd: 10_000 },
      { assetId: 'asset-3', quantity: 6, valueUsd: 18_000 },
    ],
    lastSyncedAt: new Date('2025-11-10T00:00:00.000Z'),
    createdAt: new Date('2025-10-01T00:00:00.000Z'),
    updatedAt: new Date('2025-11-10T00:00:00.000Z'),
  },
  trades: [],
  escrows: [],
  assetMap: new Map([
    ['asset-1', { name: 'Karambit | Doppler', rarity: 'legendary' }],
    ['asset-2', { name: 'AWP | Dragon Lore', rarity: 'contraband' }],
    ['asset-3', { name: 'Butterfly Knife | Fade', rarity: 'legendary' }],
  ]),
  lookbackDays: 7,
  now: new Date('2025-11-18T09:00:00.000Z'),
} as const;

describe('buildInsightsFromContext', () => {
  it('emits concentration insight when top holding exceeds threshold', () => {
    const insights = buildInsightsFromContext(baseContext);

    expect(insights.some((insight) => insight.impact === 'portfolio')).toBe(true);
    const concentration = insights.find((insight) => insight.impact === 'portfolio');
    expect(concentration?.recommendedActions).toContain(
      'Rebalance by routing part of the position through escrow-backed trades',
    );
  });

  it('flags stalled escrows older than 48 hours', () => {
    const context = {
      ...baseContext,
      escrows: [
        {
          id: 'escrow-1',
          tradeId: 'trade-123',
          buyerUserId: baseContext.userId,
          sellerUserId: '7a518b2e-44aa-448c-8970-a2fa0fcc3d6b',
          status: 'funds_captured',
          milestones: [],
          totalAmountUsd: 12_500,
          createdAt: new Date('2025-11-15T00:00:00.000Z'),
          updatedAt: new Date('2025-11-17T00:00:00.000Z'),
        },
      ],
    } as const;

    const insights = buildInsightsFromContext(context);
    const stallAlert = insights.find((insight) => insight.impact === 'risk');

    expect(stallAlert).toBeDefined();
    expect(stallAlert?.tags).toContain('escrow');
  });

  it('reports dormant trading window when no trades present', () => {
    const context = {
      ...baseContext,
      trades: [],
      escrows: [],
    } as const;

    const insights = buildInsightsFromContext(context);
    const dormant = insights.find((insight) => insight.headline.includes('Desk trading idle'));

    expect(dormant).toBeDefined();
    expect(dormant?.priority).toBe('medium');
  });
});