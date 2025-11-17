import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  TRADING_SERVICE_PORT: z.string().transform(Number).default('4200'),
  POPFLASH_MONGO_URI: z.string().url(),
  POPFLASH_STEAM_API_KEY: z.string().min(10),
  POPFLASH_STEAM_APP_ID: z.string().min(2),
  POPFLASH_DEFAULT_CURRENCY: z.string().default('USD'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Trading service env validation failed: ${JSON.stringify(parsed.error.format())}`);
}

export const env = {
  port: parsed.data.TRADING_SERVICE_PORT,
  mongoUri: parsed.data.POPFLASH_MONGO_URI,
  steamApiKey: parsed.data.POPFLASH_STEAM_API_KEY,
  steamAppId: parsed.data.POPFLASH_STEAM_APP_ID,
  defaultCurrency: parsed.data.POPFLASH_DEFAULT_CURRENCY,
} as const;