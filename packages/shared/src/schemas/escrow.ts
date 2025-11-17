import { z } from 'zod';

export const escrowStatusSchema = z.enum([
  'initiated',
  'funds_captured',
  'assets_received',
  'settled',
  'refunded',
  'cancelled',
]);

export const escrowMilestoneSchema = z.object({
  name: z.string(),
  completedAt: z.coerce.date().optional(),
});

export const escrowSchema = z.object({
  id: z.string().uuid(),
  tradeId: z.string().uuid(),
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  status: escrowStatusSchema,
  totalAmountUsd: z.number().nonnegative(),
  milestones: z.array(escrowMilestoneSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Escrow = z.infer<typeof escrowSchema>;
export type EscrowStatus = z.infer<typeof escrowStatusSchema>;
export type EscrowMilestone = z.infer<typeof escrowMilestoneSchema>;
