import { Router } from 'express';
import { z } from 'zod';

import { loginWithSteam, refreshSession } from '../clients/auth-service-client.js';
import { HttpError } from '../utils/error-handler.js';

const router = Router();

const steamLoginSchema = z.object({
  steamOpenIdToken: z.string().min(10),
});

router.post('/steam', async (req, res, next) => {
  try {
    const parsed = steamLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid Steam login payload', parsed.error.format());
    }

    const response = await loginWithSteam(parsed.data);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

router.post('/refresh', async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid refresh payload', parsed.error.format());
    }

    const response = await refreshSession(parsed.data.refreshToken);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
