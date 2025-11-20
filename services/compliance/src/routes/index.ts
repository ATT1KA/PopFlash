import { Router, type Express } from 'express';

import { getComplianceSummary } from '../services/compliance-service.js';

import { auditRouter } from './audit.js';
import { financialRouter } from './financial.js';
import { requirementsRouter } from './requirements.js';
import { verificationsRouter } from './verifications.js';

export const registerRoutes = (app: Express) => {
  const router = Router();

  router.get('/summary', async (_req, res, next) => {
    try {
      const summary = await getComplianceSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  router.use('/requirements', requirementsRouter);
  router.use('/audit-events', auditRouter);
  router.use('/verifications', verificationsRouter);
  router.use('/financial', financialRouter);

  app.use('/v1/compliance', router);
};
