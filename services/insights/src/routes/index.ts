import type { Express } from 'express';

import { insightsRouter } from './insights.js';

export const registerRoutes = (app: Express) => {
  app.use('/v1/insights', insightsRouter);
};