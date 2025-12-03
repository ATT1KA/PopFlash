import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTrade = {
  _id: 'trade-123',
  buyerUserId: 'buyer-123',
  sellerUserId: 'seller-456',
  assets: [{ assetId: 'asset-1', priceUsd: 100 }],
  subtotalUsd: 100,
  platformFeeUsd: 5,
  taxesUsd: 7.25,
  totalUsd: 112.25,
  type: 'buy',
  status: 'awaiting_payment',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

vi.mock('../repositories/trade-repository.js', () => ({
  createTrade: vi.fn().mockResolvedValue(mockTrade),
  findTradeById: vi.fn().mockResolvedValue(mockTrade),
  listTradesForUser: vi.fn().mockResolvedValue([mockTrade]),
}));

const { createTradeDraft, getTrade, getTradeHistory } = await import(
  '../services/trade-service.js'
);
const { createTrade, findTradeById, listTradesForUser } = await import(
  '../repositories/trade-repository.js'
);

describe('trade-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTradeDraft', () => {
    it('creates a trade with correct fee calculations', async () => {
      const input = {
        buyerUserId: 'buyer-123',
        sellerUserId: 'seller-456',
        assets: [{ assetId: 'asset-1', priceUsd: 100 }],
        type: 'buy' as const,
      };

      const result = await createTradeDraft(input);

      expect(createTrade).toHaveBeenCalledWith(
        expect.objectContaining({
          buyerUserId: 'buyer-123',
          sellerUserId: 'seller-456',
          subtotalUsd: 100,
          platformFeeUsd: 5,
          taxesUsd: 7.25,
          totalUsd: 112.25,
          status: 'awaiting_payment',
        })
      );

      expect(result.id).toBe('trade-123');
    });

    it('calculates fees for multiple assets', async () => {
      vi.mocked(createTrade).mockResolvedValueOnce({
        ...mockTrade,
        assets: [
          { assetId: 'asset-1', priceUsd: 100 },
          { assetId: 'asset-2', priceUsd: 200 },
        ],
        subtotalUsd: 300,
        platformFeeUsd: 15,
        taxesUsd: 21.75,
        totalUsd: 336.75,
      });

      const input = {
        buyerUserId: 'buyer-123',
        sellerUserId: 'seller-456',
        assets: [
          { assetId: 'asset-1', priceUsd: 100 },
          { assetId: 'asset-2', priceUsd: 200 },
        ],
        type: 'buy' as const,
      };

      await createTradeDraft(input);

      expect(createTrade).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotalUsd: 300,
          platformFeeUsd: 15,
          taxesUsd: 21.75,
          totalUsd: 336.75,
        })
      );
    });

    it('throws error when buyer and seller are the same', async () => {
      const input = {
        buyerUserId: 'same-user',
        sellerUserId: 'same-user',
        assets: [{ assetId: 'asset-1', priceUsd: 100 }],
        type: 'buy' as const,
      };

      await expect(createTradeDraft(input)).rejects.toThrow('Buyer and seller must be different');
    });

    it('throws error when no assets provided', async () => {
      const input = {
        buyerUserId: 'buyer-123',
        sellerUserId: 'seller-456',
        assets: [],
        type: 'buy' as const,
      };

      await expect(createTradeDraft(input)).rejects.toThrow('at least one asset');
    });
  });

  describe('getTrade', () => {
    it('returns normalized trade by ID', async () => {
      const result = await getTrade('trade-123');

      expect(findTradeById).toHaveBeenCalledWith('trade-123');
      expect(result.id).toBe('trade-123');
      expect(result.buyerUserId).toBe('buyer-123');
    });

    it('throws error when trade not found', async () => {
      vi.mocked(findTradeById).mockResolvedValueOnce(null);

      await expect(getTrade('nonexistent')).rejects.toThrow('Trade not found');
    });
  });

  describe('getTradeHistory', () => {
    it('returns list of trades for user', async () => {
      const result = await getTradeHistory('buyer-123');

      expect(listTradesForUser).toHaveBeenCalledWith('buyer-123');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('trade-123');
    });

    it('returns empty array when no trades found', async () => {
      vi.mocked(listTradesForUser).mockResolvedValueOnce([]);

      const result = await getTradeHistory('new-user');

      expect(result).toEqual([]);
    });
  });
});
