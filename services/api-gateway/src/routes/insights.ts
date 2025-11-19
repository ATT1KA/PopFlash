import {
  insightChannelSchema,
  insightImpactAreaSchema,
  insightPrioritySchema,
  insightStatusSchema,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import {
  generateInsights,
  listInsights,
  updateInsightStatus,
} from '../clients/insights-service-client.js';
import { HttpError } from '../utils/error-handler.js';

const router = Router();

const tagsSchema = z.union([z.string(), z.array(z.string())]).transform((value) => {
  const tags = Array.isArray(value) ? value : value.split(',');
  return tags.map((tag) => tag.trim()).filter(Boolean);
});

const listQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  impact: insightImpactAreaSchema.optional(),
  status: insightStatusSchema.optional(),
  priority: insightPrioritySchema.optional(),
  tags: tagsSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  after: z
    .union([z.string(), z.date()])
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

router.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid insights query parameters', parsed.error.format());
    }

    const insights = await listInsights({
      userId: parsed.data.userId,
      impact: parsed.data.impact,
      status: parsed.data.status,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      limit: parsed.data.limit,
      after: parsed.data.after,
    });

    res.status(200).json({ insights });
  } catch (error) {
    next(error);
  }
});

const generateSchema = z.object({
  userId: z.string().uuid(),
  scope: z.array(z.enum(['portfolio', 'trades', 'escrow'])).optional(),
  tags: z.array(z.string().min(1)).optional(),
  channels: z.array(insightChannelSchema).optional(),
  force: z.boolean().optional(),
});

router.post('/generate', async (req, res, next) => {
  try {
    const parsed = generateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid insight generation payload', parsed.error.format());
    }

    const response = await generateInsights(parsed.data);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

const updateStatusSchema = z.object({
  status: insightStatusSchema,
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);

    if (!params.success) {
      throw new HttpError(400, 'Invalid insight identifier', params.error.format());
    }

    const body = updateStatusSchema.safeParse(req.body);

    if (!body.success) {
      throw new HttpError(400, 'Invalid status payload', body.error.format());
    }

    const response = await updateInsightStatus(params.data.id, body.data.status);

    if (!response.insight) {
      throw new HttpError(404, 'Insight not found');
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export const insightsRouter = router;
