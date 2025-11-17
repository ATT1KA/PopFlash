import type { Escrow, Trade } from '@popflash/shared';
import { escrowSchema, tradeSchema } from '@popflash/shared';

import {
  createEscrow,
  findEscrowByTradeId,
  updateEscrowStatus,
  updateEscrowMilestones,
} from '../repositories/escrow-repository.js';
import { findTradeById } from '../repositories/trade-repository.js';
import { HttpError } from '../utils/http-error.js';

export const ESCROW_MILESTONES = [
  'Funds Captured',
  'Assets Deposited',
  'Settlement Completed',
] as const;

const STATUS_TRANSITIONS: Record<(typeof ESCROW_MILESTONES)[number], string> = {
  'Funds Captured': 'funds_captured',
  'Assets Deposited': 'assets_received',
  'Settlement Completed': 'settled',
};

type TradeRecord = Trade & { _id?: string };
type EscrowRecord = Escrow & { _id?: string };

const normalizeTrade = (trade: TradeRecord) =>
  tradeSchema.parse({
    id: trade._id ?? trade.id,
    buyerUserId: trade.buyerUserId,
    sellerUserId: trade.sellerUserId,
    assets: trade.assets,
    subtotalUsd: trade.subtotalUsd,
    platformFeeUsd: trade.platformFeeUsd,
    taxesUsd: trade.taxesUsd,
    totalUsd: trade.totalUsd,
    type: trade.type,
    status: trade.status,
    createdAt: trade.createdAt,
    updatedAt: trade.updatedAt,
  });

const normalizeEscrow = (escrow: EscrowRecord) =>
  escrowSchema.parse({
    id: escrow._id ?? escrow.id,
    tradeId: escrow.tradeId,
    buyerUserId: escrow.buyerUserId,
    sellerUserId: escrow.sellerUserId,
    status: escrow.status,
    totalAmountUsd: escrow.totalAmountUsd,
    milestones: escrow.milestones.map((milestone) => ({
      name: milestone.name,
      completedAt: milestone.completedAt ?? undefined,
    })),
    createdAt: escrow.createdAt,
    updatedAt: escrow.updatedAt,
  });

export const initiateEscrow = async ({
  tradeId,
  buyerUserId,
  sellerUserId,
  totalAmountUsd,
}: {
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  totalAmountUsd: number;
}) => {
  const trade = await findTradeById(tradeId);

  if (!trade) {
    throw new HttpError(404, 'Trade not found for escrow initiation');
  }

  const parsedTrade = normalizeTrade(trade);

  if (parsedTrade.buyerUserId !== buyerUserId || parsedTrade.sellerUserId !== sellerUserId) {
    throw new HttpError(400, 'Buyer or seller mismatch for escrow initiation');
  }

  if (Math.abs(parsedTrade.totalUsd - totalAmountUsd) > 0.5) {
    throw new HttpError(400, 'Escrow amount does not match trade total');
  }

  const existing = await findEscrowByTradeId(tradeId);

  if (existing) {
    return normalizeEscrow(existing);
  }

  const escrow = await createEscrow({
    tradeId,
    buyerUserId,
    sellerUserId,
    totalAmountUsd,
    status: 'initiated',
    milestones: ESCROW_MILESTONES.map((name) => ({ name })),
  });

  return normalizeEscrow(escrow.toObject());
};

export const getEscrowStatus = async (tradeId: string) => {
  const escrow = await findEscrowByTradeId(tradeId);

  if (!escrow) {
    throw new HttpError(404, 'Escrow record not found');
  }

  return normalizeEscrow(escrow);
};

export const markEscrowMilestone = async (tradeId: string, milestoneName: string) => {
  if (!ESCROW_MILESTONES.includes(milestoneName as (typeof ESCROW_MILESTONES)[number])) {
    throw new HttpError(400, 'Milestone not part of escrow workflow');
  }

  const escrow = await findEscrowByTradeId(tradeId);

  if (!escrow) {
    throw new HttpError(404, 'Escrow record not found');
  }

  const milestone = escrow.milestones.find((item) => item.name === milestoneName);

  if (!milestone) {
    throw new HttpError(400, 'Milestone not part of escrow workflow');
  }

  const updatedMilestones = escrow.milestones.map((item) =>
    item.name === milestoneName ? { ...item, completedAt: new Date() } : item,
  );

  const updatedEscrow = await updateEscrowMilestones(tradeId, updatedMilestones);

  if (!updatedEscrow) {
    throw new HttpError(500, 'Failed to update escrow milestones');
  }

  const nextStatus = STATUS_TRANSITIONS[milestoneName as (typeof ESCROW_MILESTONES)[number]];

  if (nextStatus) {
    const finalEscrow = await updateEscrowStatus(tradeId, nextStatus);

    if (!finalEscrow) {
      throw new HttpError(500, 'Failed to update escrow status');
    }

    return normalizeEscrow(finalEscrow);
  }

  return normalizeEscrow(updatedEscrow);
};
