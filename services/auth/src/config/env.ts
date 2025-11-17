import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  AUTH_SERVICE_PORT: z.string().transform(Number).default('4100'),
  POPFLASH_MONGO_URI: z.string().url(),
  POPFLASH_JWT_SECRET: z.string().min(32),
  POPFLASH_JWT_REFRESH_SECRET: z.string().min(32),
  POPFLASH_JWT_EXPIRATION_MINUTES: z.string().transform(Number).default('15'),
  POPFLASH_JWT_REFRESH_EXPIRATION_DAYS: z.string().transform(Number).default('30'),
  POPFLASH_STEAM_API_KEY: z.string().min(10),
  POPFLASH_STEAM_APP_ID: z.string().min(2),
  POPFLASH_STEAM_APP_NAME: z.string().default('CSVault'),
  POPFLASH_DEFAULT_COUNTRY_CODE: z.string().length(2).default('US'),
});

const rawEnv = envSchema.safeParse(process.env);

if (!rawEnv.success) {
  throw new Error(`Auth service env validation failed: ${JSON.stringify(rawEnv.error.format())}`);
}

export const env = {
  port: rawEnv.data.AUTH_SERVICE_PORT,
  mongoUri: rawEnv.data.POPFLASH_MONGO_URI,
  jwtSecret: rawEnv.data.POPFLASH_JWT_SECRET,
  jwtRefreshSecret: rawEnv.data.POPFLASH_JWT_REFRESH_SECRET,
  jwtExpirationMinutes: rawEnv.data.POPFLASH_JWT_EXPIRATION_MINUTES,
  refreshExpirationDays: rawEnv.data.POPFLASH_JWT_REFRESH_EXPIRATION_DAYS,
  steamApiKey: rawEnv.data.POPFLASH_STEAM_API_KEY,
  steamAppId: rawEnv.data.POPFLASH_STEAM_APP_ID,
  steamAppName: rawEnv.data.POPFLASH_STEAM_APP_NAME,
  defaultCountryCode: rawEnv.data.POPFLASH_DEFAULT_COUNTRY_CODE,
} as const;