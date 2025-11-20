import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    COMPLIANCE_SERVICE_PORT: z.coerce.number().int().positive().default(4500),
    POPFLASH_MONGO_URI: z.string().min(1),
    COMPLIANCE_VERIFICATION_EXPIRY_HOURS: z.coerce.number().int().positive().default(72),
    COMPLIANCE_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(60),
  })
  .transform((values) => ({
    port: values.COMPLIANCE_SERVICE_PORT,
    mongoUri: values.POPFLASH_MONGO_URI,
    verificationExpiryHours: values.COMPLIANCE_VERIFICATION_EXPIRY_HOURS,
    rateLimitPerMinute: values.COMPLIANCE_RATE_LIMIT_PER_MINUTE,
  }));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.errors
    .map((error) => `${error.path.join('.')}: ${error.message}`)
    .join(', ');
  throw new Error(`Invalid environment configuration for compliance service: ${message}`);
}

export const env = parsed.data;
