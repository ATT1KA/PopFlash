import { Router } from 'express';
import { z } from 'zod';

import {
  completeEscrowMilestone,
  fetchEscrowStatus,
  initiateEscrow,
} from '../clients/escrow-service-client.js';
import { HttpError } from '../utils/error-handler.js';

const router = Router();

const tradeIdParamSchema = z.object({
  tradeId: z.string().uuid(),
});

router.get('/:tradeId', async (req, res, next) => {
  try {
    const parsed = tradeIdParamSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid trade ID', parsed.error.format());
    }

    const authorization = req.headers.authorization;
    const response = await fetchEscrowStatus(parsed.data.tradeId, authorization);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

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

    const authorization = req.headers.authorization;
    const response = await initiateEscrow(parsed.data, authorization);
    res.status(202).json(response);
  } catch (error) {
    next(error);
  }
});

const milestoneSchema = z.object({
  milestoneName: z.enum(['Funds Captured', 'Assets Deposited', 'Settlement Completed']),
});

router.post('/:tradeId/milestones', async (req, res, next) => {
  try {
    const params = tradeIdParamSchema.safeParse(req.params);
    const body = milestoneSchema.safeParse(req.body);

    if (!params.success) {
      throw new HttpError(400, 'Invalid trade ID', params.error.format());
    }

    if (!body.success) {
      throw new HttpError(400, 'Invalid milestone payload', body.error.format());
    }

    const authorization = req.headers.authorization;
    const response = await completeEscrowMilestone(params.data.tradeId, body.data, authorization);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export const escrowRouter = router;