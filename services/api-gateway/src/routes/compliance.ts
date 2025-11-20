import {
  auditEventActorTypeSchema,
  auditEventSeveritySchema,
  complianceEvidenceTypeSchema,
  complianceFrameworkSchema,
  complianceHealthSchema,
  compliancePlatformSchema,
  complianceRequirementStatusSchema,
  verificationScopeSchema,
  verificationStatusSchema,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import {
  addComplianceRequirementEvidence,
  createAuditEvent,
  fetchComplianceSummary,
  listAuditEvents,
  listComplianceRequirements,
  listComplianceVerifications,
  listFinancialComplianceStatuses,
  startComplianceVerification,
  updateComplianceRequirementStatus,
  updateComplianceVerificationStatus,
  updateFinancialComplianceStatus,
} from '../clients/compliance-service-client.js';
import { HttpError } from '../utils/error-handler.js';

const router = Router();

router.get('/summary', async (req, res, next) => {
  try {
    const summary = await fetchComplianceSummary({ authHeader: req.headers.authorization });
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
});

const requirementsRouter = Router();

const requirementsQuerySchema = z.object({
  framework: complianceFrameworkSchema.optional(),
  status: complianceRequirementStatusSchema.optional(),
  ownerUserId: z.string().optional(),
  includeEvidence: z.coerce.boolean().optional(),
});

requirementsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = requirementsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid compliance requirement filters', parsed.error.format());
    }

    const requirements = await listComplianceRequirements(parsed.data, {
      authHeader: req.headers.authorization,
    });

    res.status(200).json({ requirements });
  } catch (error) {
    next(error);
  }
});

const requirementIdSchema = z.object({ id: z.string() });

const updateStatusSchema = z.object({
  status: complianceRequirementStatusSchema,
  actorId: z.string().optional(),
  actorLabel: z.string().optional(),
});

requirementsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const params = requirementIdSchema.safeParse(req.params);
    const body = updateStatusSchema.safeParse(req.body);

    if (!params.success) {
      throw new HttpError(400, 'Invalid requirement identifier', params.error.format());
    }

    if (!body.success) {
      throw new HttpError(400, 'Invalid requirement status payload', body.error.format());
    }

    const requirement = await updateComplianceRequirementStatus(
      params.data.id,
      body.data.status,
      { actorId: body.data.actorId, actorLabel: body.data.actorLabel },
      { authHeader: req.headers.authorization },
    );

    res.status(200).json({ requirement });
  } catch (error) {
    next(error);
  }
});

const evidenceSchema = z.object({
  title: z.string().min(2),
  type: complianceEvidenceTypeSchema,
  uri: z.string().url().optional(),
  storedAt: z.string().optional(),
  uploadedByUserId: z.union([z.string(), z.null()]).optional(),
  verifiedByUserId: z.union([z.string(), z.null()]).optional(),
  verifiedAt: z.coerce.date().nullable().optional(),
  notes: z.string().optional(),
  actorId: z.string().optional(),
  actorLabel: z.string().optional(),
});

requirementsRouter.post('/:id/evidence', async (req, res, next) => {
  try {
    const params = requirementIdSchema.safeParse(req.params);
    const body = evidenceSchema.safeParse(req.body);

    if (!params.success) {
      throw new HttpError(400, 'Invalid requirement identifier', params.error.format());
    }

    if (!body.success) {
      throw new HttpError(400, 'Invalid requirement evidence payload', body.error.format());
    }

    const requirement = await addComplianceRequirementEvidence(
      params.data.id,
      {
        title: body.data.title,
        type: body.data.type,
        uri: body.data.uri,
        storedAt: body.data.storedAt,
        uploadedByUserId: body.data.uploadedByUserId ?? null,
        verifiedByUserId: body.data.verifiedByUserId ?? null,
        verifiedAt: body.data.verifiedAt ?? null,
        notes: body.data.notes,
      },
      { actorId: body.data.actorId, actorLabel: body.data.actorLabel },
      { authHeader: req.headers.authorization },
    );

    res.status(201).json({ requirement });
  } catch (error) {
    next(error);
  }
});

router.use('/requirements', requirementsRouter);

const auditRouter = Router();

const auditQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  severity: auditEventSeveritySchema.optional(),
  eventType: z.string().optional(),
  actorId: z.string().optional(),
  after: z.coerce.date().optional(),
});

auditRouter.get('/', async (req, res, next) => {
  try {
    const parsed = auditQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid audit event filters', parsed.error.format());
    }

    const events = await listAuditEvents(parsed.data, { authHeader: req.headers.authorization });
    res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
});

const createAuditSchema = z.object({
  eventType: z.string().min(3),
  description: z.string().min(3),
  severity: auditEventSeveritySchema,
  actorType: auditEventActorTypeSchema,
  actorId: z.union([z.string(), z.null()]).optional(),
  actorLabel: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

auditRouter.post('/', async (req, res, next) => {
  try {
    const parsed = createAuditSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid audit event payload', parsed.error.format());
    }

    const event = await createAuditEvent(parsed.data, { authHeader: req.headers.authorization });
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
});

router.use('/audit-events', auditRouter);

const verificationsRouter = Router();

const verificationFiltersSchema = z.object({
  relatedEntityType: z.enum(['escrow', 'trade', 'user', 'organization']).optional(),
  relatedEntityId: z.string().optional(),
  status: verificationStatusSchema.optional(),
  scope: verificationScopeSchema.optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

verificationsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = verificationFiltersSchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid verification filters', parsed.error.format());
    }

    const verifications = await listComplianceVerifications(parsed.data, {
      authHeader: req.headers.authorization,
    });
    res.status(200).json({ verifications });
  } catch (error) {
    next(error);
  }
});

const startVerificationSchema = z.object({
  relatedEntityType: z.enum(['escrow', 'trade', 'user', 'organization']),
  relatedEntityId: z.string().min(1),
  scope: z.array(verificationScopeSchema).min(1),
  notes: z.string().optional(),
  initiatedByUserId: z.string().optional(),
  initiatedByLabel: z.string().optional(),
});

verificationsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = startVerificationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid verification payload', parsed.error.format());
    }

    const verification = await startComplianceVerification(parsed.data, {
      authHeader: req.headers.authorization,
    });
    res.status(201).json({ verification });
  } catch (error) {
    next(error);
  }
});

const updateVerificationSchema = z.object({
  status: verificationStatusSchema,
  notes: z.string().optional(),
  reviewerUserId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  actorLabel: z.string().optional(),
});

const verificationIdSchema = z.object({ id: z.string() });

verificationsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const params = verificationIdSchema.safeParse(req.params);
    const body = updateVerificationSchema.safeParse(req.body);

    if (!params.success) {
      throw new HttpError(400, 'Invalid verification identifier', params.error.format());
    }

    if (!body.success) {
      throw new HttpError(400, 'Invalid verification status payload', body.error.format());
    }

    const verification = await updateComplianceVerificationStatus(params.data.id, body.data, {
      authHeader: req.headers.authorization,
    });
    res.status(200).json({ verification });
  } catch (error) {
    next(error);
  }
});

router.use('/verifications', verificationsRouter);

const financialRouter = Router();

financialRouter.get('/', async (req, res, next) => {
  try {
    const statuses = await listFinancialComplianceStatuses({
      authHeader: req.headers.authorization,
    });
    res.status(200).json({ statuses });
  } catch (error) {
    next(error);
  }
});

const financialUpdateSchema = z.object({
  status: complianceHealthSchema,
  issues: z.array(z.string()).optional(),
  lastSyncedAt: z.coerce.date().nullable().optional(),
  nextReviewAt: z.coerce.date().nullable().optional(),
  ownerTeam: z.string().optional(),
});

const financialParamsSchema = z.object({
  platform: compliancePlatformSchema,
});

financialRouter.patch('/:platform', async (req, res, next) => {
  try {
    const params = financialParamsSchema.safeParse(req.params);
    const body = financialUpdateSchema.safeParse(req.body);

    if (!params.success) {
      throw new HttpError(400, 'Invalid compliance platform identifier', params.error.format());
    }

    if (!body.success) {
      throw new HttpError(400, 'Invalid financial status payload', body.error.format());
    }

    const status = await updateFinancialComplianceStatus(params.data.platform, body.data, {
      authHeader: req.headers.authorization,
    });
    res.status(200).json({ status });
  } catch (error) {
    next(error);
  }
});

router.use('/financial', financialRouter);

export const complianceRouter = router;
