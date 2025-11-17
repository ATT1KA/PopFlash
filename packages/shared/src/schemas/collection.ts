import { z } from 'zod';

export const collectionVisibilitySchema = z.enum(['public', 'private', 'unlisted']);

export const collectionItemSchema = z.object({
  assetId: z.string(),
  note: z.string().max(160).optional(),
  order: z.number().int().nonnegative(),
});

export const collectionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
  visibility: collectionVisibilitySchema,
  items: z.array(collectionItemSchema),
  followersCount: z.number().int().nonnegative(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Collection = z.infer<typeof collectionSchema>;
export type CollectionItem = z.infer<typeof collectionItemSchema>;
export type CollectionVisibility = z.infer<typeof collectionVisibilitySchema>;
