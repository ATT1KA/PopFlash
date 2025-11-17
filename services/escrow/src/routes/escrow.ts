import { Router } from 'express';
import { z } from 'zod';

import {
  ESCROW_MILESTONES,
  getEscrowStatus,
  initiateEscrow,
  markEscrowMilestone,
} from '../services/escrow-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const initiateSchema = z.object({
  tradeId: z.string().uuid(),
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  totalAmountUsd: z.number().positive(),
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = initiateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid escrow initiation payload', parsed.error.format());
    }

    const escrow = await initiateEscrow(parsed.data);
    res.status(201).json(escrow);
  } catch (error) {
    next(error);
  }
});

const tradeParamSchema = z.object({
  tradeId: z.string().uuid(),
});

router.get('/:tradeId', async (req, res, next) => {
  try {
    const parsed = tradeParamSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid trade identifier', parsed.error.format());
    }

    const escrow = await getEscrowStatus(parsed.data.tradeId);
    res.status(200).json(escrow);
  } catch (error) {
    next(error);
  }
});

const milestoneSchema = z.object({
  milestoneName: z.enum(ESCROW_MILESTONES),
});

router.post('/:tradeId/milestones', async (req, res, next) => {
  try {
    const params = tradeParamSchema.safeParse(req.params);
    const body = milestoneSchema.safeParse(req.body);

    if (!params.success) {
      throw new HttpError(400, 'Invalid trade identifier', params.error.format());
    }

    if (!body.success) {
      throw new HttpError(400, 'Invalid milestone payload', body.error.format());
    }

    const escrow = await markEscrowMilestone(params.data.tradeId, body.data.milestoneName);
    res.status(200).json(escrow);
  } catch (error) {
    next(error);
  }
});

export const escrowRouter = router;