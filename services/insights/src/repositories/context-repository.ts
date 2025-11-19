import {
  AssetModel,
  EscrowModel,
  PortfolioModel,
  TradeModel,
  type EscrowDocument,
  type PortfolioDocument,
  type Trade,
} from '@popflash/database';
import type { FilterQuery } from 'mongoose';

export const findPortfolioByUserId = (userId: string) =>
  PortfolioModel.findOne({ userId }).lean().exec();

export const listRecentTradesForUser = (userId: string, since: Date, limit: number) => {
  const query: FilterQuery<Trade> = {
    createdAt: { $gte: since },
    $or: [{ buyerUserId: userId }, { sellerUserId: userId }],
  };

  return TradeModel.find(query).sort({ createdAt: -1 }).limit(limit).lean().exec();
};

export const listOpenEscrowsForUser = (userId: string) =>
  EscrowModel.find({
    $or: [{ buyerUserId: userId }, { sellerUserId: userId }],
    status: { $ne: 'settled' },
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

export const findAssetsByIds = (assetIds: string[]) =>
  assetIds.length > 0
    ? AssetModel.find({ _id: { $in: assetIds } })
        .lean()
        .exec()
    : Promise.resolve([]);

export type PortfolioRecord = PortfolioDocument & { _id?: string };
export type EscrowRecord = EscrowDocument & { _id?: string };
export type TradeRecord = Trade & { _id?: string };
