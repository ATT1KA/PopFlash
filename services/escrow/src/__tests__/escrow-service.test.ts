import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTrade = {
  _id: 'trade-123',
  id: 'trade-123',
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

const mockEscrow = {
  _id: 'escrow-123',
  tradeId: 'trade-123',
  buyerUserId: 'buyer-123',
  sellerUserId: 'seller-456',
  status: 'initiated',
  totalAmountUsd: 112.25,
  milestones: [
    { name: 'Funds Captured', completedAt: null },
    { name: 'Assets Deposited', completedAt: null },
    { name: 'Settlement Completed', completedAt: null },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  toObject: () => mockEscrow,
};

vi.mock('../repositories/trade-repository.js', () => ({
  findTradeById: vi.fn().mockResolvedValue(mockTrade),
}));

vi.mock('../repositories/escrow-repository.js', () => ({
  createEscrow: vi.fn().mockResolvedValue(mockEscrow),
  findEscrowByTradeId: vi.fn().mockResolvedValue(null),
  updateEscrowStatus: vi.fn().mockResolvedValue(mockEscrow),
  updateEscrowMilestones: vi.fn().mockResolvedValue(mockEscrow),
}));

vi.mock('../services/compliance-integration-service.js', () => ({
  ensureEscrowComplianceVerification: vi.fn().mockResolvedValue({}),
  syncEscrowComplianceForMilestone: vi.fn().mockResolvedValue(undefined),
}));

const { initiateEscrow, getEscrowStatus, markEscrowMilestone } = await import(
  '../services/escrow-service.js'
);
const { findTradeById } = await import('../repositories/trade-repository.js');
const {
  createEscrow,
  findEscrowByTradeId,
  updateEscrowStatus,
  updateEscrowMilestones,
} = await import('../repositories/escrow-repository.js');

describe('escrow-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initiateEscrow', () => {
    it('creates escrow for valid trade', async () => {
      const result = await initiateEscrow({
        tradeId: 'trade-123',
        buyerUserId: 'buyer-123',
        sellerUserId: 'seller-456',
        totalAmountUsd: 112.25,
      });

      expect(findTradeById).toHaveBeenCalledWith('trade-123');
      expect(createEscrow).toHaveBeenCalledWith(
        expect.objectContaining({
          tradeId: 'trade-123',
          buyerUserId: 'buyer-123',
          sellerUserId: 'seller-456',
          totalAmountUsd: 112.25,
          status: 'initiated',
        })
      );

      expect(result.id).toBe('escrow-123');
      expect(result.milestones).toHaveLength(3);
    });

    it('returns existing escrow if already created', async () => {
      vi.mocked(findEscrowByTradeId).mockResolvedValueOnce(mockEscrow);

      const result = await initiateEscrow({
        tradeId: 'trade-123',
        buyerUserId: 'buyer-123',
        sellerUserId: 'seller-456',
        totalAmountUsd: 112.25,
      });

      expect(createEscrow).not.toHaveBeenCalled();
      expect(result.id).toBe('escrow-123');
    });

    it('throws error when trade not found', async () => {
      vi.mocked(findTradeById).mockResolvedValueOnce(null);

      await expect(
        initiateEscrow({
          tradeId: 'nonexistent',
          buyerUserId: 'buyer-123',
          sellerUserId: 'seller-456',
          totalAmountUsd: 112.25,
        })
      ).rejects.toThrow('Trade not found');
    });

    it('throws error when buyer/seller mismatch', async () => {
      await expect(
        initiateEscrow({
          tradeId: 'trade-123',
          buyerUserId: 'wrong-buyer',
          sellerUserId: 'seller-456',
          totalAmountUsd: 112.25,
        })
      ).rejects.toThrow('Buyer or seller mismatch');
    });

    it('throws error when amount mismatch exceeds threshold', async () => {
      await expect(
        initiateEscrow({
          tradeId: 'trade-123',
          buyerUserId: 'buyer-123',
          sellerUserId: 'seller-456',
          totalAmountUsd: 200,
        })
      ).rejects.toThrow('does not match trade total');
    });
  });

  describe('getEscrowStatus', () => {
    it('returns escrow status for trade', async () => {
      vi.mocked(findEscrowByTradeId).mockResolvedValueOnce(mockEscrow);

      const result = await getEscrowStatus('trade-123');

      expect(findEscrowByTradeId).toHaveBeenCalledWith('trade-123');
      expect(result.id).toBe('escrow-123');
      expect(result.status).toBe('initiated');
    });

    it('throws error when escrow not found', async () => {
      vi.mocked(findEscrowByTradeId).mockResolvedValueOnce(null);

      await expect(getEscrowStatus('nonexistent')).rejects.toThrow('Escrow record not found');
    });
  });

  describe('markEscrowMilestone', () => {
    it('marks milestone as completed', async () => {
      vi.mocked(findEscrowByTradeId).mockResolvedValueOnce(mockEscrow);
      vi.mocked(updateEscrowMilestones).mockResolvedValueOnce({
        ...mockEscrow,
        milestones: [
          { name: 'Funds Captured', completedAt: new Date() },
          { name: 'Assets Deposited', completedAt: null },
          { name: 'Settlement Completed', completedAt: null },
        ],
      });
      vi.mocked(updateEscrowStatus).mockResolvedValueOnce({
        ...mockEscrow,
        status: 'funds_captured',
      });

      const result = await markEscrowMilestone('trade-123', 'Funds Captured');

      expect(updateEscrowMilestones).toHaveBeenCalled();
      expect(updateEscrowStatus).toHaveBeenCalledWith('trade-123', 'funds_captured');
      expect(result).toBeDefined();
    });

    it('throws error for invalid milestone name', async () => {
      await expect(markEscrowMilestone('trade-123', 'Invalid Milestone')).rejects.toThrow(
        'Milestone not part of escrow workflow'
      );
    });

    it('throws error when escrow not found', async () => {
      vi.mocked(findEscrowByTradeId).mockResolvedValueOnce(null);

      await expect(markEscrowMilestone('trade-123', 'Funds Captured')).rejects.toThrow(
        'Escrow record not found'
      );
    });
  });
});
