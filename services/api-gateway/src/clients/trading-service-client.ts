import type { Asset, Trade } from '@popflash/shared';

import { config } from '../config.js';

import { createHttpClient, get, post } from './http-client.js';

interface PortfolioHolding {
  assetId: string;
  quantity: number;
  valueUsd: number;
  asset?: Asset;
}

interface PortfolioSummary {
  userId: string;
  totalValueUsd: number;
  holdings: PortfolioHolding[];
  lastSyncedAt: string | null;
}

interface CreateTradePayload {
  buyerUserId: string;
  sellerUserId: string;
  type: 'buy' | 'sell';
  assets: Array<{ assetId: string; priceUsd: number }>;
}

const client = createHttpClient(config.tradingServiceUrl, config.requestTimeoutMs);

export const fetchPortfolio = (userId: string, authHeader?: string) =>
  get<PortfolioSummary>(client, `/v1/portfolio/${userId}`, {
    headers: {
      Authorization: authHeader,
    },
  });

export const syncSteamInventory = (userId: string, authHeader?: string) =>
  post<PortfolioSummary>(
    client,
    `/v1/portfolio/${userId}/sync`,
    {},
    {
      headers: {
        Authorization: authHeader,
      },
    },
  );

export const createTrade = (payload: CreateTradePayload, authHeader?: string) =>
  post<Trade>(client, '/v1/trades', payload, {
    headers: {
      Authorization: authHeader,
    },
  });

export const fetchTrade = (tradeId: string, authHeader?: string) =>
  get<Trade>(client, `/v1/trades/${tradeId}`, {
    headers: {
      Authorization: authHeader,
    },
  });

export const fetchTradeHistory = (userId: string, authHeader?: string) =>
  get<Trade[]>(client, `/v1/trades/user/${userId}`, {
    headers: {
      Authorization: authHeader,
    },
  });
