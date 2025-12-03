import { Router, raw } from 'express';
import { z } from 'zod';

import {
  initiateKycVerification,
  getKycStatus,
  processKycWebhook,
} from '../services/kyc-service.js';
import { HttpError } from '../utils/http-error.js';

const router = Router();

const initiateSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

router.post('/initiate', async (req, res, next) => {
  try {
    const parsed = initiateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid KYC initiation payload', parsed.error.format());
    }

    const result = await initiateKycVerification(parsed.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

const userIdSchema = z.object({
  userId: z.string().uuid(),
});

router.get('/status/:userId', async (req, res, next) => {
  try {
    const parsed = userIdSchema.safeParse(req.params);

    if (!parsed.success) {
      throw new HttpError(400, 'Invalid user ID', parsed.error.format());
    }

    const result = await getKycStatus(parsed.data.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/webhooks/persona',
  raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const signature = req.headers['persona-signature'];

      if (!signature || typeof signature !== 'string') {
        throw new HttpError(400, 'Missing Persona signature');
      }

      const payload = req.body.toString('utf8');
      const result = await processKycWebhook(payload, signature);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

export const kycRouter = router;
