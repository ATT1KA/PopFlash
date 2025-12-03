import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    PAYMENTS_SERVICE_PORT: z.coerce.number().int().positive().default(4600),
    POPFLASH_MONGO_URI: z.string().min(1),
    POPFLASH_STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    POPFLASH_STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
    POPFLASH_STRIPE_PLATFORM_ACCOUNT_ID: z.string().optional(),
    PAYMENTS_CURRENCY: z.string().length(3).default('usd'),
  })
  .transform((values) => ({
    port: values.PAYMENTS_SERVICE_PORT,
    mongoUri: values.POPFLASH_MONGO_URI,
    stripeSecretKey: values.POPFLASH_STRIPE_SECRET_KEY,
    stripeWebhookSecret: values.POPFLASH_STRIPE_WEBHOOK_SECRET,
    stripePlatformAccountId: values.POPFLASH_STRIPE_PLATFORM_ACCOUNT_ID,
    currency: values.PAYMENTS_CURRENCY,
  }));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.errors
    .map((error) => `${error.path.join('.')}: ${error.message}`)
    .join(', ');
  throw new Error(`Invalid environment configuration for payments service: ${message}`);
}

export const env = parsed.data;
