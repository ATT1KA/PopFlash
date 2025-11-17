import { z } from 'zod';

export const tradeStatusSchema = z.enum([
  'draft',
  'awaiting_payment',
  'payment_captured',
  'assets_in_escrow',
  'settled',
  'cancelled',
  'disputed',
]);

export const tradeTypeSchema = z.enum(['buy', 'sell']);

export const tradeSchema = z.object({
  id: z.string().uuid(),
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  assets: z.array(
    z.object({
      assetId: z.string(),
      priceUsd: z.number().nonnegative(),
    }),
  ),
  subtotalUsd: z.number().nonnegative(),
  platformFeeUsd: z.number().nonnegative(),
  taxesUsd: z.number().nonnegative(),
  totalUsd: z.number().nonnegative(),
  type: tradeTypeSchema,
  status: tradeStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Trade = z.infer<typeof tradeSchema>;
export type TradeStatus = z.infer<typeof tradeStatusSchema>;
export type TradeType = z.infer<typeof tradeTypeSchema>;
