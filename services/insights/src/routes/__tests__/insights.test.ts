import express, { json } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { errorHandler } from '../../utils/error-handler.js';
import { insightsRouter } from '../insights.js';

vi.mock('../../services/insight-service.js', () => ({
  fetchInsights: vi.fn(),
  generateInsightsForUser: vi.fn(),
  setInsightStatus: vi.fn(),
}));

const { fetchInsights, generateInsightsForUser, setInsightStatus } = await import(
  '../../services/insight-service.js'
);

const createApp = () => {
  const app = express();
  app.use(json());
  app.use('/v1/insights', insightsRouter);
  app.use(errorHandler);
  return app;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('insightsRouter', () => {
  it('returns insights feed for GET /v1/insights', async () => {
    const insight = {
      id: 'a45442de-f0b6-4bc8-9fd6-6f6b5b65eb17',
      userId: 'f72ec71e-7e8f-43d0-af95-9e8fcd1b7cd2',
      headline: 'Test Insight',
      detail: 'Detailed summary',
      narrative: 'Narrative context',
      sentiment: 'neutral',
      impact: 'operations',
      confidence: 0.6,
      priority: 'medium',
      status: 'active',
      recommendedActions: [],
      supportingMetrics: [],
      tags: [],
      channels: ['in_app'],
      references: [],
      metadata: {},
      generatedAt: new Date(),
      updatedAt: new Date(),
      assetId: null,
      tradeId: null,
      expiresAt: null,
    } as const;

    fetchInsights.mockResolvedValueOnce([insight]);

    const app = createApp();
    const response = await request(app).get('/v1/insights').query({ limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.insights).toHaveLength(1);
    expect(fetchInsights).toHaveBeenCalledWith({ limit: 10 });
  });

  it('invokes generator for POST /v1/insights/generate', async () => {
    const generated = [{ ...{ id: '6ce8cf7a-32cd-4d51-bc89-a5e410132df9' } }];
    generateInsightsForUser.mockResolvedValueOnce(generated);

    const app = createApp();
    const response = await request(app)
      .post('/v1/insights/generate')
      .send({ userId: 'f72ec71e-7e8f-43d0-af95-9e8fcd1b7cd2', force: true });

    expect(response.status).toBe(201);
    expect(response.body.generatedCount).toBe(generated.length);
    expect(generateInsightsForUser).toHaveBeenCalledWith({
      userId: 'f72ec71e-7e8f-43d0-af95-9e8fcd1b7cd2',
      force: true,
    });
  });

  it('returns 404 when updating status for missing insight', async () => {
    setInsightStatus.mockResolvedValueOnce(null);

    const app = createApp();
    const response = await request(app)
      .patch('/v1/insights/1a6292e6-86bb-4d8b-a16f-f02ce0d8a350/status')
      .send({ status: 'archived' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Insight not found');
  });
});
