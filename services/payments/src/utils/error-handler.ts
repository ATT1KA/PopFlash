import type { ErrorRequestHandler } from 'express';

import { HttpError } from './http-error.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    message: 'Internal server error',
  });
};
