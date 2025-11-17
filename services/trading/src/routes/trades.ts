import { Router } from 'express';
import { z } from 'zod';

import { createTradeDraft, getTrade, getTradeHistory } from '../services/trade-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const createTradeSchema = z.object({
  buyerUserId: z.string().uuid(),
  sellerUserId: z.string().uuid(),
  type: z.enum(['buy', 'sell']),
  assets: z
    .array(
      z.object({
        assetId: z.string(),
        priceUsd: z.number().nonnegative(),
      }),
    )
    .min(1),
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createTradeSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid trade payload', parsed.error.format());
    }

    const trade = await createTradeDraft(parsed.data);
    res.status(201).json(trade);
  } catch (error) {
    next(error);
  }
});

const userIdSchema = z.object({
  userId: z.string().uuid(),
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const parsed = userIdSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user identifier', parsed.error.format());
    }

    const trades = await getTradeHistory(parsed.data.userId);
    res.status(200).json(trades);
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
      throw new HttpError(400, 'Invalid trade identifier', parsed.error.format());
    }

    const trade = await getTrade(parsed.data.tradeId);
    res.status(200).json(trade);
  } catch (error) {
    next(error);
  }
});

export const tradesRouter = router;
