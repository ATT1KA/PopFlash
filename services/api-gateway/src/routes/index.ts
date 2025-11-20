import type { Express } from 'express';

import { authRouter } from './auth.js';
import { complianceRouter } from './compliance.js';
import { escrowRouter } from './escrow.js';
import { insightsRouter } from './insights.js';
import { portfolioRouter } from './portfolio.js';
import { tradesRouter } from './trades.js';

export const registerRoutes = (app: Express) => {
  app.use('/v1/auth', authRouter);
  app.use('/v1/portfolio', portfolioRouter);
  app.use('/v1/escrow', escrowRouter);
  app.use('/v1/trades', tradesRouter);
  app.use('/v1/insights', insightsRouter);
  app.use('/v1/compliance', complianceRouter);
};
