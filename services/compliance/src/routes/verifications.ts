import {
  complianceVerificationSchema,
  verificationScopeSchema,
  verificationStatusSchema,
  type ComplianceVerification,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import {
  listComplianceVerifications,
  startVerification,
  updateVerification,
} from '../services/verification-service.js';

const listQuerySchema = z.object({
  relatedEntityType: complianceVerificationSchema.shape.relatedEntityType.optional(),
  relatedEntityId: z.string().optional(),
  status: verificationStatusSchema.optional(),
  scope: verificationScopeSchema.optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

const startSchema = z.object({
  relatedEntityType: complianceVerificationSchema.shape.relatedEntityType,
  relatedEntityId: z.string(),
  scope: z.array(verificationScopeSchema).min(1),
  notes: z.string().optional(),
  initiatedByUserId: z.string().optional(),
  initiatedByLabel: z.string().optional(),
});

const updateSchema = z.object({
  status: verificationStatusSchema,
  notes: z.string().optional(),
  reviewerUserId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  actorLabel: z.string().optional(),
});

type VerificationRecord = ComplianceVerification & { _id?: string };

const toResponse = (verification: VerificationRecord) => ({
  id: verification._id ? verification._id.toString() : verification.id,
  relatedEntityType: verification.relatedEntityType,
  relatedEntityId: verification.relatedEntityId,
  scope: verification.scope,
  status: verification.status,
  notes: verification.notes,
  reviewerUserId: verification.reviewerUserId,
  evidenceIds: verification.evidenceIds,
  initiatedAt: verification.initiatedAt,
  completedAt: verification.completedAt,
  expiresAt: verification.expiresAt,
  lastUpdatedAt: verification.lastUpdatedAt,
});

export const verificationsRouter = Router();

verificationsRouter.get('/', async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query);
    const verifications = await listComplianceVerifications(filters);
    res.json(verifications.map(toResponse));
  } catch (error) {
    next(error);
  }
});

verificationsRouter.post('/', async (req, res, next) => {
  try {
    const body = startSchema.parse(req.body);
    const verification = await startVerification(body);
    res.status(201).json(toResponse(verification));
  } catch (error) {
    next(error);
  }
});

verificationsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = updateSchema.parse(req.body);

    const verification = await updateVerification(
      id,
      {
        status: body.status,
        notes: body.notes,
        reviewerUserId: body.reviewerUserId,
        evidenceIds: body.evidenceIds,
      },
      {
        actorLabel: body.actorLabel,
      },
    );

    res.json(toResponse(verification));
  } catch (error) {
    next(error);
  }
});
