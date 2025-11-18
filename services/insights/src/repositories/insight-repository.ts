import { InsightModel } from '@popflash/database';
import type {
  Insight,
  InsightImpactArea,
  InsightPriority,
  InsightStatus,
} from '@popflash/shared';
import type { FilterQuery } from 'mongoose';

export interface ListInsightsFilters {
  userId?: string;
  impact?: InsightImpactArea;
  status?: InsightStatus;
  priority?: InsightPriority;
  tags?: string[];
  limit?: number;
  after?: Date;
}

export interface InsightDraft
  extends Omit<
    Insight,
    'id' | 'generatedAt' | 'updatedAt' | 'status' | 'channels' | 'recommendedActions' | 'supportingMetrics' | 'tags' | 'references' | 'metadata'
  > {
  status?: InsightStatus;
  channels?: Insight['channels'];
  recommendedActions?: Insight['recommendedActions'];
  supportingMetrics?: Insight['supportingMetrics'];
  tags?: Insight['tags'];
  references?: Insight['references'];
  metadata?: Insight['metadata'];
  generatedAt?: Date;
  updatedAt?: Date;
}

const DEFAULT_LIMIT = 20;

export const listInsights = (filters: ListInsightsFilters) => {
  const query: FilterQuery<Insight> = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.impact) {
    query.impact = filters.impact;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $all: filters.tags };
  }

  if (filters.after) {
    query.generatedAt = { $gt: filters.after };
  }

  const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), 50);

  return InsightModel.find(query).sort({ generatedAt: -1 }).limit(limit).lean().exec();
};

export const createInsights = (drafts: InsightDraft[]) => {
  const now = new Date();

  return InsightModel.insertMany(
    drafts.map((draft) => ({
      ...draft,
      generatedAt: draft.generatedAt ?? now,
      updatedAt: draft.updatedAt ?? now,
    })),
    { ordered: false },
  );
};

export const updateInsightStatus = async (id: string, status: InsightStatus) => {
  const updated = await InsightModel.findByIdAndUpdate(
    id,
    { status, updatedAt: new Date() },
    { new: true },
  )
    .lean()
    .exec();

  return updated;
};