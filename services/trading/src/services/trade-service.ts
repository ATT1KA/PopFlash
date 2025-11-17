import { tradeSchema, tradeStatusSchema, tradeTypeSchema } from '@popflash/shared';

import { createTrade, findTradeById, listTradesForUser } from '../repositories/trade-repository.js';
import { HttpError } from '../utils/http-error.js';

const PLATFORM_FEE_RATE = 0.05;
const TAX_RATE = 0.0725;

const normalizeTrade = (trade: any) =>
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

interface CreateTradeInput {
  buyerUserId: string;
  sellerUserId: string;
  assets: Array<{ assetId: string; priceUsd: number }>;
  type: (typeof tradeTypeSchema)._type;
}

export const createTradeDraft = async (input: CreateTradeInput) => {
  if (input.buyerUserId === input.sellerUserId) {
    throw new HttpError(400, 'Buyer and seller must be different users');
  }

  if (input.assets.length === 0) {
    throw new HttpError(400, 'Trade must include at least one asset');
  }

  const subtotalUsd = input.assets.reduce((acc, asset) => acc + asset.priceUsd, 0);
  const platformFeeUsd = Number((subtotalUsd * PLATFORM_FEE_RATE).toFixed(2));
  const taxesUsd = Number((subtotalUsd * TAX_RATE).toFixed(2));
  const totalUsd = Number((subtotalUsd + platformFeeUsd + taxesUsd).toFixed(2));

  const trade = await createTrade({
    buyerUserId: input.buyerUserId,
    sellerUserId: input.sellerUserId,
    assets: input.assets,
    subtotalUsd,
    platformFeeUsd,
    taxesUsd,
    totalUsd,
    type: input.type,
    status: tradeStatusSchema.enum.awaiting_payment,
  });

  return normalizeTrade(trade);
};

export const getTrade = async (tradeId: string) => {
  const trade = await findTradeById(tradeId);

  if (!trade) {
    throw new HttpError(404, 'Trade not found');
  }

  return normalizeTrade(trade);
};

export const getTradeHistory = async (userId: string) => {
  const trades = await listTradesForUser(userId);
  return trades.map((trade) => normalizeTrade(trade));
};