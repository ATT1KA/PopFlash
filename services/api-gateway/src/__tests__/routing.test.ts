import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config.js', () => ({
  config: {
    port: 4000,
    authServiceUrl: 'http://localhost:4100',
    tradingServiceUrl: 'http://localhost:4200',
    escrowServiceUrl: 'http://localhost:4300',
    insightsServiceUrl: 'http://localhost:4400',
    complianceServiceUrl: 'http://localhost:4500',
    corsOrigins: ['http://localhost:3000'],
    requestTimeoutMs: 10000,
  },
}));

vi.mock('../clients/http-client.js', () => ({
  createHttpClient: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ data: { status: 'ok' } }),
    post: vi.fn().mockResolvedValue({ data: { id: 'test-123' } }),
    put: vi.fn().mockResolvedValue({ data: { updated: true } }),
    patch: vi.fn().mockResolvedValue({ data: { patched: true } }),
    delete: vi.fn().mockResolvedValue({ data: { deleted: true } }),
  })),
}));

vi.mock('../clients/auth-service-client.js', () => ({
  authServiceClient: {
    steamAuth: vi.fn().mockResolvedValue({
      user: { id: 'user-123', steamId: '76561198012345678' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    }),
    refreshTokens: vi.fn().mockResolvedValue({
      user: { id: 'user-123' },
      tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    }),
  },
}));

vi.mock('../clients/trading-service-client.js', () => ({
  tradingServiceClient: {
    createTrade: vi.fn().mockResolvedValue({ id: 'trade-123', status: 'draft' }),
    getTrade: vi.fn().mockResolvedValue({ id: 'trade-123', status: 'draft' }),
    getTradeHistory: vi.fn().mockResolvedValue([{ id: 'trade-123' }]),
    getPortfolio: vi.fn().mockResolvedValue({ holdings: [], totalValueUsd: 0 }),
    syncPortfolio: vi.fn().mockResolvedValue({ holdings: [], totalValueUsd: 0 }),
  },
}));

vi.mock('../clients/escrow-service-client.js', () => ({
  escrowServiceClient: {
    initiateEscrow: vi.fn().mockResolvedValue({ id: 'escrow-123', status: 'initiated' }),
    getEscrowStatus: vi.fn().mockResolvedValue({ id: 'escrow-123', status: 'initiated' }),
    markMilestone: vi.fn().mockResolvedValue({ id: 'escrow-123', status: 'funds_captured' }),
  },
}));

const { registerRoutes } = await import('../routes/index.js');
const { authServiceClient } = await import('../clients/auth-service-client.js');
const { tradingServiceClient } = await import('../clients/trading-service-client.js');
const { escrowServiceClient } = await import('../clients/escrow-service-client.js');

const createApp = () => {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: err.message });
  });
  return app;
};

describe('API Gateway Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth routes', () => {
    it('POST /v1/auth/steam - authenticates with Steam', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/v1/auth/steam')
        .send({ ticket: 'valid-ticket' });

      expect(response.status).toBe(200);
      expect(authServiceClient.steamAuth).toHaveBeenCalledWith('valid-ticket');
      expect(response.body.user).toBeDefined();
      expect(response.body.tokens).toBeDefined();
    });

    it('POST /v1/auth/refresh - refreshes tokens', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(authServiceClient.refreshTokens).toHaveBeenCalledWith('valid-refresh-token');
    });
  });

  describe('Trading routes', () => {
    it('POST /v1/trades - creates a trade', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/v1/trades')
        .send({
          buyerUserId: 'buyer-123',
          sellerUserId: 'seller-456',
          assets: [{ assetId: 'asset-1', priceUsd: 100 }],
          type: 'buy',
        });

      expect(response.status).toBe(201);
      expect(tradingServiceClient.createTrade).toHaveBeenCalled();
    });

    it('GET /v1/trades/:tradeId - gets trade by ID', async () => {
      const app = createApp();

      const response = await request(app).get('/v1/trades/trade-123');

      expect(response.status).toBe(200);
      expect(tradingServiceClient.getTrade).toHaveBeenCalledWith('trade-123');
    });

    it('GET /v1/portfolio/:userId - gets user portfolio', async () => {
      const app = createApp();

      const response = await request(app).get('/v1/portfolio/user-123');

      expect(response.status).toBe(200);
      expect(tradingServiceClient.getPortfolio).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Escrow routes', () => {
    it('POST /v1/escrow - initiates escrow', async () => {
      const app = createApp();

      const response = await request(app)
        .post('/v1/escrow')
        .send({
          tradeId: 'trade-123',
          buyerUserId: 'buyer-123',
          sellerUserId: 'seller-456',
          totalAmountUsd: 100,
        });

      expect(response.status).toBe(201);
      expect(escrowServiceClient.initiateEscrow).toHaveBeenCalled();
    });

    it('GET /v1/escrow/:tradeId - gets escrow status', async () => {
      const app = createApp();

      const response = await request(app).get('/v1/escrow/trade-123');

      expect(response.status).toBe(200);
      expect(escrowServiceClient.getEscrowStatus).toHaveBeenCalledWith('trade-123');
    });
  });
});
