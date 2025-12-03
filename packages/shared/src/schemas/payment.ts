import { z } from 'zod';

export const paymentStatusSchema = z.enum([
  'pending',
  'requires_action',
  'requires_capture',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'refunded',
]);

export const paymentSchema = z.object({
  id: z.string(),
  tradeId: z.string().uuid(),
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  stripePaymentIntentId: z.string(),
  stripeCustomerId: z.string().optional(),
  clientSecret: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3),
  status: paymentStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
