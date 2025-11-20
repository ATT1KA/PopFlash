import {
  complianceEvidenceTypeSchema,
  complianceFrameworkSchema,
  complianceRequirementStatusSchema,
  type ComplianceRequirement,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import {
  addRequirementEvidence,
  listComplianceRequirements,
  updateRequirementStatus,
} from '../services/compliance-service.js';
import { HttpError } from '../utils/http-error.js';

const requirementsQuerySchema = z.object({
  framework: complianceFrameworkSchema.optional(),
  status: complianceRequirementStatusSchema.optional(),
  ownerUserId: z.string().optional(),
  includeEvidence: z.coerce.boolean().optional().default(false),
});

const updateStatusSchema = z.object({
  status: complianceRequirementStatusSchema,
  actorId: z.string().optional(),
  actorLabel: z.string().optional(),
});

const evidenceSchema = z.object({
  title: z.string().min(2),
  type: complianceEvidenceTypeSchema,
  uri: z.string().url().optional(),
  storedAt: z.string().optional(),
  uploadedByUserId: z.string().nullable().optional(),
  verifiedByUserId: z.string().nullable().optional(),
  verifiedAt: z.coerce.date().nullable().optional(),
  notes: z.string().optional(),
  actorId: z.string().optional(),
  actorLabel: z.string().optional(),
});

type RequirementRecord = ComplianceRequirement & { _id?: string };

const toResponse = (requirement: RequirementRecord) => ({
  id: requirement._id ? requirement._id.toString() : requirement.id,
  framework: requirement.framework,
  key: requirement.key,
  title: requirement.title,
  description: requirement.description,
  status: requirement.status,
  ownerUserId: requirement.ownerUserId,
  dueDate: requirement.dueDate,
  lastReviewedAt: requirement.lastReviewedAt,
  evidence: requirement.evidence,
  createdAt: requirement.createdAt,
  updatedAt: requirement.updatedAt,
});

export const requirementsRouter = Router();

requirementsRouter.get('/', async (req, res, next) => {
  try {
    const filters = requirementsQuerySchema.parse(req.query);
    const requirements = await listComplianceRequirements(filters);
    res.json(requirements.map(toResponse));
  } catch (error) {
    next(error);
  }
});

requirementsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = updateStatusSchema.parse(req.body);

    const requirement = await updateRequirementStatus(id, body.status, {
      actorId: body.actorId,
      actorLabel: body.actorLabel,
    });

    if (!requirement) {
      throw new HttpError(404, `Requirement ${id} not found`);
    }

    res.json(toResponse(requirement));
  } catch (error) {
    next(error);
  }
});

requirementsRouter.post('/:id/evidence', async (req, res, next) => {
  try {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = evidenceSchema.parse(req.body);

    const updated = await addRequirementEvidence(
      id,
      {
        title: body.title,
        type: body.type,
        uri: body.uri,
        storedAt: body.storedAt,
        uploadedByUserId: body.uploadedByUserId ?? null,
        verifiedByUserId: body.verifiedByUserId ?? null,
        verifiedAt: body.verifiedAt ?? null,
        notes: body.notes,
      },
      {
        actorId: body.actorId,
        actorLabel: body.actorLabel,
      },
    );

    res.status(201).json(toResponse(updated));
  } catch (error) {
    next(error);
  }
});
