import {
  auditEventActorTypeSchema,
  auditEventSeveritySchema,
  type AuditEvent,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import { listAuditEvents, recordAuditEvent } from '../services/audit-service.js';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
  severity: auditEventSeveritySchema.optional(),
  eventType: z.string().optional(),
  actorId: z.string().optional(),
  after: z.coerce.date().optional(),
});

const createAuditSchema = z.object({
  eventType: z.string().min(3),
  description: z.string().min(3),
  severity: auditEventSeveritySchema,
  actorType: auditEventActorTypeSchema,
  actorId: z.string().nullable().optional(),
  actorLabel: z.string().optional(),
  source: z.string().default('compliance-service'),
  metadata: z.record(z.any()).optional(),
});

type AuditEventRecord = AuditEvent & { _id?: string };

const toResponse = (event: AuditEventRecord) => ({
  id: event._id ? event._id.toString() : event.id,
  eventType: event.eventType,
  description: event.description,
  severity: event.severity,
  actorType: event.actorType,
  actorId: event.actorId ?? null,
  actorLabel: event.actorLabel,
  source: event.source,
  metadata: event.metadata ?? {},
  occurredAt: event.occurredAt,
  createdAt: event.createdAt,
});

export const auditRouter = Router();

auditRouter.get('/', async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query);
    const events = await listAuditEvents(filters);
    res.json(events.map(toResponse));
  } catch (error) {
    next(error);
  }
});

auditRouter.post('/', async (req, res, next) => {
  try {
    const body = createAuditSchema.parse(req.body);
    const event = await recordAuditEvent({
      eventType: body.eventType,
      description: body.description,
      severity: body.severity,
      actorType: body.actorType,
      actorId: body.actorId ?? null,
      actorLabel: body.actorLabel,
      source: body.source,
      metadata: body.metadata ?? {},
    });

    res.status(201).json(toResponse(event));
  } catch (error) {
    next(error);
  }
});
