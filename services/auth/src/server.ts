import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { connectMongo } from '@popflash/database';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/error-handler.js';

export const createServer = async () => {
  await connectMongo(env.mongoUri);

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan('combined'));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 60,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'auth', timestamp: new Date().toISOString() });
  });

  app.use('/v1/auth', authRouter);
  app.use(errorHandler);

  return app;
};