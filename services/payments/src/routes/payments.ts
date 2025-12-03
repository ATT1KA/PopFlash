import { Router } from 'express';
import { z } from 'zod';

import {
  initiatePaymentForTrade,
  getPaymentStatus,
  cancelPayment,
} from '../services/payment-intent-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const initiatePaymentSchema = z.object({
  tradeId: z.string().uuid(),
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  amountUsd: z.number().positive(),
  stripeCustomerId: z.string().optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = initiatePaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid payment initiation payload', parsed.error.format());
    }

    const result = await initiatePaymentForTrade(parsed.data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

const tradeIdSchema = z.object({
  tradeId: z.string().uuid(),
});

router.get('/:tradeId', async (req, res, next) => {
  try {
    const parsed = tradeIdSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid trade ID', parsed.error.format());
    }

    const result = await getPaymentStatus(parsed.data.tradeId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:tradeId/cancel', async (req, res, next) => {
  try {
    const parsed = tradeIdSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid trade ID', parsed.error.format());
    }

    const result = await cancelPayment(parsed.data.tradeId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const paymentsRouter = router;
