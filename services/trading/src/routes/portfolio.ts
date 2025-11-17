import { Router } from 'express';
import { z } from 'zod';

import { getPortfolio, syncPortfolioFromSteam } from '../services/portfolio-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const paramsSchema = z.object({
  userId: z.string().uuid(),
});

router.get('/:userId', async (req, res, next) => {
  try {
    const parsed = paramsSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user identifier', parsed.error.format());
    }

    const portfolio = await getPortfolio(parsed.data.userId);
    res.status(200).json(portfolio);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/sync', async (req, res, next) => {
  try {
    const parsed = paramsSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user identifier', parsed.error.format());
    }

    const portfolio = await syncPortfolioFromSteam(parsed.data.userId);
    res.status(202).json(portfolio);
  } catch (error) {
    next(error);
  }
});

export const portfolioRouter = router;
