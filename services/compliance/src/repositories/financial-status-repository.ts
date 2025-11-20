import { FinancialComplianceStatusModel } from '@popflash/database';
import type { ComplianceHealth, CompliancePlatform } from '@popflash/shared';

export const listFinancialStatuses = () =>
  FinancialComplianceStatusModel.find().sort({ platform: 1 }).lean().exec();

export const upsertFinancialStatus = async ({
  platform,
  status,
  issues,
  lastSyncedAt,
  nextReviewAt,
  ownerTeam,
}: {
  platform: CompliancePlatform;
  status: ComplianceHealth;
  issues?: string[];
  lastSyncedAt?: Date | null;
  nextReviewAt?: Date | null;
  ownerTeam?: string;
}) =>
  FinancialComplianceStatusModel.findOneAndUpdate(
    { platform },
    (() => {
      const update: Record<string, unknown> = {
        platform,
        status,
        issues: issues ?? [],
        lastSyncedAt: lastSyncedAt ?? null,
        nextReviewAt: nextReviewAt ?? null,
        updatedAt: new Date(),
      };

      if (typeof ownerTeam !== 'undefined') {
        update.ownerTeam = ownerTeam;
      }

      return {
        $set: update,
        $setOnInsert: { createdAt: new Date() },
      };
    })(),
    { new: true, upsert: true, lean: true },
  );

export const getFinancialStatusByPlatform = (platform: CompliancePlatform) =>
  FinancialComplianceStatusModel.findOne({ platform }).lean().exec();
