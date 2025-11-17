import axios from 'axios';

interface SteamInventoryAsset {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

interface SteamInventoryDescription {
  classid: string;
  instanceid: string;
  market_hash_name: string;
  icon_url: string;
  type: string;
  tags: Array<{
    category: string;
    localized_tag_name: string;
  }>;
}

interface SteamInventoryResponse {
  assets: SteamInventoryAsset[];
  descriptions: SteamInventoryDescription[];
}

export interface AggregatedInventoryItem {
  marketHashName: string;
  iconUrl?: string;
  type?: string;
  rarity?: string;
  quantity: number;
}

const rarityCategories = new Set(['Rarity', 'Quality']);

export const fetchSteamInventory = async (steamId: string): Promise<AggregatedInventoryItem[]> => {
  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=en&count=5000`;
  const { data } = await axios.get<SteamInventoryResponse>(url, { timeout: 10_000 });

  const descriptionsMap = new Map(
    data.descriptions.map((desc) => [`${desc.classid}_${desc.instanceid}`, desc]),
  );

  const aggregation = new Map<string, AggregatedInventoryItem>();

  for (const asset of data.assets) {
    const key = `${asset.classid}_${asset.instanceid}`;
    const description = descriptionsMap.get(key);

    if (!description) {
      continue;
    }

    const rarity = description.tags.find((tag) => rarityCategories.has(tag.category))?.localized_tag_name;
    const existing = aggregation.get(description.market_hash_name);
    const amount = Number.parseInt(asset.amount, 10) || 1;

    if (existing) {
      existing.quantity += amount;
      aggregation.set(description.market_hash_name, existing);
      continue;
    }

    aggregation.set(description.market_hash_name, {
      marketHashName: description.market_hash_name,
      iconUrl: description.icon_url,
      type: description.type,
      rarity,
      quantity: amount,
    });
  }

  return [...aggregation.values()];
};