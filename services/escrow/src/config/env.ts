import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  ESCROW_SERVICE_PORT: z.coerce.number().int().positive().default(4300),
  POPFLASH_MONGO_URI: z.string().url(),
  POPFLASH_ESCROW_DISBURSEMENT_ACCOUNT: z.string().default('popflash-operating'),
  COMPLIANCE_SERVICE_URL: z.string().url().default('http://localhost:4500'),
  COMPLIANCE_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Escrow service env validation failed: ${JSON.stringify(parsed.error.format())}`);
}

export const env = {
  port: parsed.data.ESCROW_SERVICE_PORT,
  mongoUri: parsed.data.POPFLASH_MONGO_URI,
  disbursementAccount: parsed.data.POPFLASH_ESCROW_DISBURSEMENT_ACCOUNT,
  complianceServiceUrl: parsed.data.COMPLIANCE_SERVICE_URL,
  complianceRequestTimeoutMs: parsed.data.COMPLIANCE_SERVICE_TIMEOUT_MS,
} as const;
