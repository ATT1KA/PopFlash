import 'dotenv/config';

const requiredEnv = [
  'API_GATEWAY_PORT',
  'AUTH_SERVICE_URL',
  'TRADING_SERVICE_URL',
  'ESCROW_SERVICE_URL',
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `API Gateway missing env vars: ${missing.join(', ')}. Using defaults where possible.`,
  );
}

export const config = {
  port: Number(process.env.API_GATEWAY_PORT ?? 4000),
  authServiceUrl: process.env.AUTH_SERVICE_URL ?? 'http://localhost:4100',
  tradingServiceUrl: process.env.TRADING_SERVICE_URL ?? 'http://localhost:4200',
  escrowServiceUrl: process.env.ESCROW_SERVICE_URL ?? 'http://localhost:4300',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
  requestTimeoutMs: Number(process.env.API_GATEWAY_TIMEOUT_MS ?? 10_000),
} as const;
