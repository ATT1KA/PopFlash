import { z } from 'zod';

export const assetRaritySchema = z.enum([
  'consumer',
  'industrial',
  'mil-spec',
  'restricted',
  'classified',
  'covert',
  'contraband',
  'legendary',
]);

export const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  steamMarketHashName: z.string(),
  iconUrl: z.string().url().optional(),
  rarity: assetRaritySchema,
  suggestedPriceUsd: z.number().nonnegative(),
  suggestedPriceUpdatedAt: z.coerce.date(),
  ownerUserId: z.string().uuid().nullable(),
});

export type Asset = z.infer<typeof assetSchema>;
export type AssetRarity = z.infer<typeof assetRaritySchema>;
