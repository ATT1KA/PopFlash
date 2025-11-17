import axios from 'axios';

import { env } from '../config/env.js';

interface PriceOverviewResponse {
  success: boolean;
  lowest_price?: string;
  median_price?: string;
}

const currencyMap: Record<string, string> = {
  USD: '1',
  EUR: '3',
  GBP: '2',
};

const normalizePrice = (price?: string) => {
  if (!price) {
    return null;
  }

  const normalized = price.replace(/[^0-9.,]/g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);

  return Number.isFinite(value) ? value : null;
};

export const fetchSteamPrice = async (marketHashName: string) => {
  const currency = currencyMap[env.defaultCurrency] ?? '1';
  const params = new URLSearchParams({
    appid: env.steamAppId,
    currency,
    market_hash_name: marketHashName,
  });

  const url = `https://steamcommunity.com/market/priceoverview/?${params.toString()}`;
  const { data } = await axios.get<PriceOverviewResponse>(url, { timeout: 10_000 });

  if (!data.success) {
    return null;
  }

  const price = normalizePrice(data.median_price ?? data.lowest_price);

  return price;
};