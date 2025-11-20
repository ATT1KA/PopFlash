import { ComplianceRequirementModel } from '@popflash/database';
import type {
  ComplianceEvidence,
  ComplianceFramework,
  ComplianceRequirement,
  ComplianceRequirementStatus,
} from '@popflash/shared';
import type { FilterQuery, UpdateQuery } from 'mongoose';

export interface RequirementFilters {
  framework?: ComplianceFramework;
  status?: ComplianceRequirementStatus;
  ownerUserId?: string;
  includeEvidence?: boolean;
}

export const listRequirements = (filters: RequirementFilters = {}) => {
  const query: FilterQuery<ComplianceRequirement> = {};

  if (filters.framework) {
    query.framework = filters.framework;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.ownerUserId) {
    query.ownerUserId = filters.ownerUserId;
  }

  const projection = filters.includeEvidence ? undefined : { evidence: 0 };

  return ComplianceRequirementModel.find(query)
    .sort({ framework: 1, key: 1 })
    .select(projection)
    .lean()
    .exec();
};

export const getRequirementById = (id: string) =>
  ComplianceRequirementModel.findById(id).lean().exec();

export const updateRequirementById = (id: string, update: UpdateQuery<ComplianceRequirement>) =>
  ComplianceRequirementModel.findByIdAndUpdate(
    id,
    { ...update, updatedAt: new Date() },
    { new: true },
  )
    .lean()
    .exec();

export const appendEvidenceToRequirement = async (id: string, evidence: ComplianceEvidence) =>
  ComplianceRequirementModel.findByIdAndUpdate(
    id,
    {
      $push: { evidence },
      $set: { updatedAt: new Date(), lastReviewedAt: new Date() },
    },
    { new: true },
  )
    .lean()
    .exec();

export interface RequirementSummary {
  framework: ComplianceFramework;
  total: number;
  byStatus: Record<ComplianceRequirementStatus, number>;
}

export const getFrameworkSummaries = async () => {
  const results = await ComplianceRequirementModel.aggregate<{
    _id: { framework: string; status: string };
    count: number;
  }>([
    {
      $group: {
        _id: { framework: '$framework', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const grouped = new Map<string, RequirementSummary>();

  for (const item of results) {
    const framework = item._id.framework as ComplianceFramework;
    const status = item._id.status as ComplianceRequirementStatus;
    const summary = grouped.get(framework) ?? {
      framework,
      total: 0,
      byStatus: {
        not_started: 0,
        in_progress: 0,
        blocked: 0,
        complete: 0,
        deferred: 0,
      },
    };

    summary.total += item.count;
    summary.byStatus[status] += item.count;
    grouped.set(framework, summary);
  }

  return Array.from(grouped.values()).sort((a, b) => a.framework.localeCompare(b.framework));
};
