import { z } from 'zod';

export const insightChannelSchema = z.enum(['push', 'email', 'in_app', 'webhook']);
export const insightSentimentSchema = z.enum(['bullish', 'neutral', 'bearish']);
export const insightImpactAreaSchema = z.enum(['portfolio', 'operations', 'risk']);
export const insightPrioritySchema = z.enum(['low', 'medium', 'high']);
export const insightStatusSchema = z.enum(['draft', 'active', 'archived']);

export const insightMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string().optional(),
});

export const insightReferenceSchema = z.object({
  type: z.enum(['trade', 'asset', 'portfolio', 'counterparty', 'compliance']).default('portfolio'),
  id: z.string().min(1).optional(),
});

export const insightSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable().default(null),
  assetId: z.string().nullable().default(null),
  tradeId: z.string().nullable().default(null),
  headline: z.string().min(3),
  detail: z.string().min(10),
  narrative: z.string().min(10),
  sentiment: insightSentimentSchema,
  impact: insightImpactAreaSchema,
  confidence: z.number().min(0).max(1),
  priority: insightPrioritySchema.default('medium'),
  status: insightStatusSchema.default('active'),
  recommendedActions: z.array(z.string()).optional().default([]),
  supportingMetrics: z.array(insightMetricSchema).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  channels: z.array(insightChannelSchema).optional().default(['in_app']),
  references: z.array(insightReferenceSchema).optional().default([]),
  metadata: z.record(z.unknown()).optional().default({}),
  generatedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable().default(null),
});

export type Insight = z.infer<typeof insightSchema>;
export type InsightChannel = z.infer<typeof insightChannelSchema>;
export type InsightSentiment = z.infer<typeof insightSentimentSchema>;
export type InsightImpactArea = z.infer<typeof insightImpactAreaSchema>;
export type InsightPriority = z.infer<typeof insightPrioritySchema>;
export type InsightStatus = z.infer<typeof insightStatusSchema>;
export type InsightMetric = z.infer<typeof insightMetricSchema>;
