import { TradeModel } from '@popflash/database';
import type { Trade } from '@popflash/shared';

export const createTrade = (input: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) =>
  TradeModel.create(input);

export const findTradeById = (tradeId: string) => TradeModel.findById(tradeId).lean().exec();

export const listTradesForUser = (userId: string) =>
  TradeModel.find({ $or: [{ buyerUserId: userId }, { sellerUserId: userId }] })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
    .exec();
