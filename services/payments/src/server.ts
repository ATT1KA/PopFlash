import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { registerRoutes } from './routes/index.js';
import { errorHandler } from './utils/error-handler.js';

export const createServer = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));

  // JSON parsing for non-webhook routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/v1/webhooks')) {
      return next();
    }
    return express.json()(req, res, next);
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', service: 'payments' });
  });

  app.get('/ready', (_req, res) => {
    res.status(200).json({ status: 'ready', service: 'payments' });
  });

  registerRoutes(app);
  app.use(errorHandler);

  return app;
};
