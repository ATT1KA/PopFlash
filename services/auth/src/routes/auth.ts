import { Router } from 'express';
import { z } from 'zod';

import { authenticateWithSteam, rotateRefreshToken } from '../services/auth-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const steamAuthSchema = z.object({
  ticket: z.string().min(10),
});

router.post('/steam', async (req, res, next) => {
  try {
    const parsed = steamAuthSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid Steam authentication payload', parsed.error.format());
    }

    const result = await authenticateWithSteam(parsed.data.ticket);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

router.post('/refresh', async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid refresh token payload', parsed.error.format());
    }

    const result = await rotateRefreshToken(parsed.data.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;