import { Router } from 'express';
import { z } from 'zod';

import { createTrade, fetchTrade, fetchTradeHistory } from '../clients/trading-service-client.js';
import { HttpError } from '../utils/error-handler.js';

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

    const authorization = req.headers.authorization;
    const trade = await createTrade(parsed.data, authorization);
    res.status(201).json(trade);
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

    const authorization = req.headers.authorization;
    const trade = await fetchTrade(parsed.data.tradeId, authorization);
    res.status(200).json(trade);
  } catch (error) {
    next(error);
  }
});

const userParamSchema = z.object({
  userId: z.string().uuid(),
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const parsed = userParamSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user identifier', parsed.error.format());
    }

    const authorization = req.headers.authorization;
    const trades = await fetchTradeHistory(parsed.data.userId, authorization);
    res.status(200).json(trades);
  } catch (error) {
    next(error);
  }
});

export const tradesRouter = router;
