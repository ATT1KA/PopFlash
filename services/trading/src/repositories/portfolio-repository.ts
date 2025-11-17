import { PortfolioModel } from '@popflash/database';

export const findPortfolioByUserId = (userId: string) =>
  PortfolioModel.findOne({ userId }).lean().exec();

export const upsertPortfolio = async (
  userId: string,
  holdings: Array<{ assetId: string; quantity: number; valueUsd: number }>,
  lastSyncedAt: Date,
) => {
  const totalValueUsd = holdings.reduce((acc, item) => acc + item.valueUsd, 0);

  return PortfolioModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        holdings,
        totalValueUsd,
        lastSyncedAt,
      },
    },
    { upsert: true, new: true, lean: true },
  ).exec();
};
