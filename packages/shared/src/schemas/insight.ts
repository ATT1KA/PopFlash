import { z } from 'zod';

export const insightChannelSchema = z.enum(['push', 'email', 'in_app']);

export const insightSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  assetId: z.string().nullable(),
  title: z.string().min(3),
  body: z.string().min(10),
  generatedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  channels: z.array(insightChannelSchema),
  metadata: z.record(z.any()).default({}),
});

export type Insight = z.infer<typeof insightSchema>;
export type InsightChannel = z.infer<typeof insightChannelSchema>;
