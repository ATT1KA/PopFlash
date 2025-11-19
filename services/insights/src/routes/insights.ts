import {
  insightChannelSchema,
  insightImpactAreaSchema,
  insightPrioritySchema,
  insightStatusSchema,
} from '@popflash/shared';
import { Router } from 'express';
import { z } from 'zod';

import {
  fetchInsights,
  generateInsightsForUser,
  setInsightStatus,
} from '../services/insight-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const tagsSchema = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split(',')).map((tag) => tag.trim()).filter(Boolean),
  );

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
    const query = listQuerySchema.parse(req.query);
    const insights = await fetchInsights({
      userId: query.userId,
      impact: query.impact,
      status: query.status,
      priority: query.priority,
      tags: query.tags,
      limit: query.limit,
      after: query.after,
    });

    res.json({ insights });
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
    const body = generateSchema.parse(req.body);
    const insights = await generateInsightsForUser(body);

    res.status(201).json({ insights, generatedCount: insights.length });
  } catch (error) {
    next(error);
  }
});

const updateStatusSchema = z.object({
  status: insightStatusSchema,
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = updateStatusSchema.parse(req.body);

    const insight = await setInsightStatus(params.id, body.status);

    if (!insight) {
      throw new HttpError(404, 'Insight not found');
    }

    res.json({ insight });
  } catch (error) {
    next(error);
  }
});

export const insightsRouter = router;
