import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    INSIGHTS_SERVICE_PORT: z.coerce.number().int().positive().default(4400),
    POPFLASH_MONGO_URI: z.string().min(1),
    INSIGHTS_GENERATION_LOOKBACK_DAYS: z.coerce.number().int().positive().default(7),
    INSIGHTS_MAX_RECENT_TRADES: z.coerce.number().int().positive().default(50),
  })
  .transform((values) => ({
    port: values.INSIGHTS_SERVICE_PORT,
    mongoUri: values.POPFLASH_MONGO_URI,
    generationLookbackDays: values.INSIGHTS_GENERATION_LOOKBACK_DAYS,
    maxRecentTrades: values.INSIGHTS_MAX_RECENT_TRADES,
  }));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.errors.map((error) => `${error.path.join('.')}: ${error.message}`).join(', ');
  throw new Error(`Invalid environment configuration for insights service: ${message}`);
}

export const env = parsed.data;