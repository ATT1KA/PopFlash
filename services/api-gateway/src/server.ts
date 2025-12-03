import cors from 'cors';
import express, { json, urlencoded, type NextFunction, type Request, type Response } from 'express';
import expressRateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './utils/error-handler.js';

export const createServer = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(morgan('combined'));
  app.use(
    expressRateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  app.get('/ready', (_req: Request, res: Response) => {
    res.json({ status: 'ready', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  registerRoutes(app);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    errorHandler(err, res);
  });

  return app;
};
