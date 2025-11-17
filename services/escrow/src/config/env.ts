import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  ESCROW_SERVICE_PORT: z.string().transform(Number).default('4300'),
  POPFLASH_MONGO_URI: z.string().url(),
  POPFLASH_ESCROW_DISBURSEMENT_ACCOUNT: z.string().default('popflash-operating'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Escrow service env validation failed: ${JSON.stringify(parsed.error.format())}`);
}

export const env = {
  port: parsed.data.ESCROW_SERVICE_PORT,
  mongoUri: parsed.data.POPFLASH_MONGO_URI,
  disbursementAccount: parsed.data.POPFLASH_ESCROW_DISBURSEMENT_ACCOUNT,
} as const;