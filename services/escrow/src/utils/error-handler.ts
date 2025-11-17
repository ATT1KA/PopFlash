import type { NextFunction, Request, Response } from 'express';

import { HttpError } from './http-error.js';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  void _next;
  const status = error instanceof HttpError ? error.status : 500;

  res.status(status).json({
    status,
    message: error.message,
    details: error instanceof HttpError ? error.details : undefined,
  });
};
