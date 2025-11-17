import type { Express } from 'express';

import { portfolioRouter } from './portfolio.js';
import { tradesRouter } from './trades.js';

export const registerRoutes = (app: Express) => {
  app.use('/v1/portfolio', portfolioRouter);
  app.use('/v1/trades', tradesRouter);
};