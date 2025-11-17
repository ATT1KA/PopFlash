import type { Response } from 'express';

interface ErrorResponse {
  status: number;
  message: string;
  details?: unknown;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const errorHandler = (error: Error, res: Response) => {
  const response: ErrorResponse = {
    status: error instanceof HttpError ? error.status : 500,
    message: error.message ?? 'Internal Server Error',
  };

  if (error instanceof HttpError && error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && !(error instanceof HttpError)) {
    response.details = error.stack;
  }

  res.status(response.status).json(response);
};
