import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectMongo } from '@popflash/database';

import { env } from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './utils/error-handler.js';

export const createServer = async () => {
  await connectMongo(env.mongoUri);

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: '*', credentials: false }));
  app.use(express.json());
  app.use(morgan('combined'));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'trading', timestamp: new Date().toISOString() });
  });

  registerRoutes(app);
  app.use(errorHandler);

  return app;
};