import { connectMongo } from '@popflash/database';
import cors from 'cors';
import express, { json } from 'express';
import expressRateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './utils/error-handler.js';

export const createServer = async () => {
  await connectMongo(env.mongoUri);

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: '*', credentials: false }));
  app.use(json());
  app.use(morgan('combined'));
  app.use(
    expressRateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'insights', timestamp: new Date().toISOString() });
  });

  registerRoutes(app);
  app.use(errorHandler);

  return app;
};