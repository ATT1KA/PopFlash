import type { Express } from 'express';

import { escrowRouter } from './escrow.js';

export const registerRoutes = (app: Express) => {
  app.use('/v1/escrow', escrowRouter);
};
