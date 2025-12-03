import type { Express } from 'express';

import { paymentsRouter } from './payments.js';
import { webhooksRouter } from './webhooks.js';

export const registerRoutes = (app: Express) => {
  app.use('/v1/payments', paymentsRouter);
  app.use('/v1/webhooks', webhooksRouter);
};
