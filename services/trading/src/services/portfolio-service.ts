import { assetSchema } from '@popflash/shared';

import { HttpError } from '../utils/http-error.js';
import { findUserById } from '../repositories/user-repository.js';
import { findPortfolioByUserId, upsertPortfolio } from '../repositories/portfolio-repository.js';
import { findAssetsByIds, upsertAssetByMarketHash } from '../repositories/asset-repository.js';
import { fetchSteamInventory } from '../steam/fetch-inventory.js';
import { fetchSteamPrice } from '../steam/fetch-price.js';

const rarityMap: Record<string, string> = {
  'consumer grade': 'consumer',
  'industrial grade': 'industrial',
  'mil-spec grade': 'mil-spec',
  restricted: 'restricted',
  classified: 'classified',
  covert: 'covert',
  contraband: 'contraband',
  legendary: 'legendary',
};

const normalizeRarity = (rarity?: string) => {
  if (!rarity) {
    return 'consumer';
  }

  const normalized = rarity.toLowerCase();
  return rarityMap[normalized] ?? 'consumer';
};

export const getPortfolio = async (userId: string) => {
  const portfolio = await findPortfolioByUserId(userId);

  if (!portfolio) {
    return {
      userId,
      totalValueUsd: 0,
      holdings: [],
      lastSyncedAt: null,
    };
  }

  return enrichPortfolio(portfolio);
};

export const syncPortfolioFromSteam = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (!user.steamId) {
    throw new HttpError(400, 'User does not have a linked Steam account');
  }

  const inventory = await fetchSteamInventory(user.steamId);
  const lastSyncedAt = new Date();

  if (inventory.length === 0) {
    await upsertPortfolio(userId, [], lastSyncedAt);
    return {
      userId,
      totalValueUsd: 0,
      holdings: [],
      lastSyncedAt,
    };
  }

  const holdings = [] as Array<{ assetId: string; quantity: number; valueUsd: number }>;

  for (const item of inventory) {
    const priceUsd = (await fetchSteamPrice(item.marketHashName)) ?? 0;
    const asset = await upsertAssetByMarketHash({
      marketHashName: item.marketHashName,
      name: item.marketHashName,
      iconUrl: item.iconUrl
        ? `https://steamcommunity-a.akamaihd.net/economy/image/${item.iconUrl}`
        : undefined,
      rarity: normalizeRarity(item.rarity),
      suggestedPriceUsd: priceUsd,
    });

    holdings.push({
      assetId: asset._id,
      quantity: item.quantity,
      valueUsd: priceUsd * item.quantity,
    });
  }

  const portfolio = await upsertPortfolio(userId, holdings, lastSyncedAt);

  return enrichPortfolio(portfolio);
};

const enrichPortfolio = async (portfolio: any) => {
  const assetIds = portfolio.holdings.map((holding: any) => holding.assetId);

  const assets = assetIds.length > 0 ? await findAssetsByIds(assetIds) : [];
  const assetMap = new Map(
    assets.map((asset) => [asset._id, assetSchema.parse({
      id: asset._id,
      name: asset.name,
      description: asset.description ?? undefined,
      steamMarketHashName: asset.steamMarketHashName,
      iconUrl: asset.iconUrl ?? undefined,
      rarity: asset.rarity,
      suggestedPriceUsd: asset.suggestedPriceUsd,
      suggestedPriceUpdatedAt: asset.suggestedPriceUpdatedAt,
      ownerUserId: asset.ownerUserId ?? null,
    })]),
  );

  return {
    userId: portfolio.userId,
    totalValueUsd: portfolio.totalValueUsd,
    holdings: portfolio.holdings.map((holding: any) => ({
      assetId: holding.assetId,
      quantity: holding.quantity,
      valueUsd: holding.valueUsd,
      asset: assetMap.get(holding.assetId),
    })),
    lastSyncedAt: portfolio.lastSyncedAt,
    updatedAt: portfolio.updatedAt,
    createdAt: portfolio.createdAt,
  };
};