import { Router } from 'express';
import { z } from 'zod';

import { fetchPortfolio, syncSteamInventory } from '../clients/trading-service-client.js';
import { HttpError } from '../utils/error-handler.js';

const router = Router();

const userIdParamSchema = z.object({
  userId: z.string().uuid(),
});

router.get('/:userId', async (req, res, next) => {
  try {
    const parsed = userIdParamSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user ID', parsed.error.format());
    }

    const authorization = req.headers.authorization;
    const response = await fetchPortfolio(parsed.data.userId, authorization);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/sync', async (req, res, next) => {
  try {
    const parsed = userIdParamSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user ID', parsed.error.format());
    }

    const authorization = req.headers.authorization;
    const response = await syncSteamInventory(parsed.data.userId, authorization);
    res.status(202).json(response);
  } catch (error) {
    next(error);
  }
});

export const portfolioRouter = router;