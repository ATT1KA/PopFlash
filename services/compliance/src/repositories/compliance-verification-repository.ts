import { ComplianceVerificationModel } from '@popflash/database';
import type {
  ComplianceVerification,
  VerificationScope,
  VerificationStatus,
} from '@popflash/shared';
import type { FilterQuery } from 'mongoose';

export interface VerificationFilters {
  relatedEntityType?: ComplianceVerification['relatedEntityType'];
  relatedEntityId?: string;
  status?: VerificationStatus;
  scope?: VerificationScope;
  limit?: number;
}

export const listVerifications = (filters: VerificationFilters = {}) => {
  const query: FilterQuery<ComplianceVerification> = {};

  if (filters.relatedEntityType) {
    query.relatedEntityType = filters.relatedEntityType;
  }

  if (filters.relatedEntityId) {
    query.relatedEntityId = filters.relatedEntityId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.scope) {
    query.scope = filters.scope;
  }

  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);

  return ComplianceVerificationModel.find(query)
    .sort({ lastUpdatedAt: -1 })
    .limit(limit)
    .lean()
    .exec();
};

export const createVerification = (verification: ComplianceVerification) =>
  ComplianceVerificationModel.create({
    _id: verification.id,
    relatedEntityType: verification.relatedEntityType,
    relatedEntityId: verification.relatedEntityId,
    scope: verification.scope,
    status: verification.status,
    notes: verification.notes,
    reviewerUserId: verification.reviewerUserId ?? null,
    evidenceIds: verification.evidenceIds ?? [],
    initiatedAt: verification.initiatedAt,
    completedAt: verification.completedAt ?? null,
    expiresAt: verification.expiresAt ?? null,
    lastUpdatedAt: verification.lastUpdatedAt,
  });

export const updateVerificationStatus = async (
  id: string,
  update: Partial<
    Pick<
      ComplianceVerification,
      'status' | 'notes' | 'reviewerUserId' | 'completedAt' | 'expiresAt' | 'evidenceIds'
    >
  >,
) =>
  ComplianceVerificationModel.findByIdAndUpdate(
    id,
    {
      ...update,
      lastUpdatedAt: new Date(),
      completedAt:
        update.status && ['passed', 'failed'].includes(update.status)
          ? update.completedAt ?? new Date()
          : update.completedAt ?? null,
    },
    { new: true },
  )
    .lean()
    .exec();

export const getVerificationById = (id: string) =>
  ComplianceVerificationModel.findById(id).lean().exec();

export const getVerificationStatusCounts = async () => {
  const results = await ComplianceVerificationModel.aggregate<{
    _id: string;
    count: number;
  }>([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return results.reduce<Record<string, number>>((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};
