import { AssetModel } from '@popflash/database';

export const upsertAssetByMarketHash = async ({
  marketHashName,
  name,
  iconUrl,
  rarity,
  suggestedPriceUsd,
}: {
  marketHashName: string;
  name: string;
  iconUrl?: string;
  rarity?: string;
  suggestedPriceUsd: number;
}) => {
  const asset = await AssetModel.findOneAndUpdate(
    { steamMarketHashName: marketHashName },
    {
      $set: {
        name,
        iconUrl,
        rarity: rarity?.toLowerCase() ?? 'consumer',
        suggestedPriceUsd,
        suggestedPriceUpdatedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      lean: true,
    },
  ).exec();

  if (!asset) {
    throw new Error('Failed to upsert asset');
  }

  return asset;
};

export const findAssetsByIds = (ids: string[]) =>
  AssetModel.find({ _id: { $in: ids } })
    .lean()
    .exec();
