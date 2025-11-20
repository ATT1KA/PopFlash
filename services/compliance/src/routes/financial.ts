import {
  complianceHealthSchema,
  compliancePlatformSchema,
  type FinancialComplianceStatus,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import {
  listComplianceFinancialStatuses,
  updateFinancialStatus,
} from '../services/financial-service.js';

const updateSchema = z.object({
  status: complianceHealthSchema,
  issues: z.array(z.string()).optional(),
  lastSyncedAt: z.coerce.date().nullable().optional(),
  nextReviewAt: z.coerce.date().nullable().optional(),
  ownerTeam: z.string().optional(),
});

type FinancialStatusRecord = FinancialComplianceStatus & { _id?: string };

const toResponse = (status: FinancialStatusRecord) => ({
  id: status._id ? status._id.toString() : status.id,
  platform: status.platform,
  status: status.status,
  issues: status.issues,
  lastSyncedAt: status.lastSyncedAt,
  nextReviewAt: status.nextReviewAt,
  ownerTeam: status.ownerTeam,
  createdAt: status.createdAt,
  updatedAt: status.updatedAt,
});

export const financialRouter = Router();

financialRouter.get('/', async (_req, res, next) => {
  try {
    const statuses = await listComplianceFinancialStatuses();
    res.json(statuses.map(toResponse));
  } catch (error) {
    next(error);
  }
});

financialRouter.patch('/:platform', async (req, res, next) => {
  try {
    const { platform } = z.object({ platform: compliancePlatformSchema }).parse(req.params);
    const body = updateSchema.parse(req.body);

    const status = await updateFinancialStatus(platform, {
      status: body.status,
      issues: body.issues,
      lastSyncedAt: body.lastSyncedAt ?? null,
      nextReviewAt: body.nextReviewAt ?? null,
      ownerTeam: body.ownerTeam,
    });

    res.json(toResponse(status));
  } catch (error) {
    next(error);
  }
});
