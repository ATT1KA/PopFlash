import type {
  Insight,
  InsightChannel,
  InsightImpactArea,
  InsightPriority,
  InsightStatus,
} from '@popflash/shared';

import { config } from '../config.js';

import { createHttpClient, get, patch, post } from './http-client.js';

const client = createHttpClient(config.insightsServiceUrl, config.requestTimeoutMs);

export interface ListInsightsParams {
  userId?: string;
  impact?: InsightImpactArea;
  status?: InsightStatus;
  priority?: InsightPriority;
  tags?: string[];
  limit?: number;
  after?: Date;
}

export interface GenerateInsightsPayload {
  userId: string;
  scope?: Array<'portfolio' | 'trades' | 'escrow'>;
  tags?: string[];
  channels?: InsightChannel[];
  force?: boolean;
}

export const listInsights = async (params: ListInsightsParams = {}) => {
  const query: Record<string, unknown> = {};

  if (params.userId) query.userId = params.userId;
  if (params.impact) query.impact = params.impact;
  if (params.status) query.status = params.status;
  if (params.priority) query.priority = params.priority;
  if (params.limit) query.limit = params.limit;
  if (params.tags?.length) query.tags = params.tags.join(',');
  if (params.after) query.after = params.after.toISOString();

  const response = await get<{ insights: Insight[] }>(client, '/v1/insights', {
    params: query,
  });

  return response.insights;
};

export const generateInsights = (payload: GenerateInsightsPayload) =>
  post<{ insights: Insight[]; generatedCount: number }>(client, '/v1/insights/generate', payload);

export const updateInsightStatus = (id: string, status: InsightStatus) =>
  patch<{ insight: Insight | null }>(client, `/v1/insights/${id}/status`, { status });
