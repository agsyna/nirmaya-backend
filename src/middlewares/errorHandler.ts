import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const notFound = (_request: Request, response: Response) => {
  response.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (error: unknown, request: Request, response: Response, _next: NextFunction) => {
  // Log errors in production
  if (env.isProduction) {
    console.error({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Validation failed', details: error.flatten() });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  // Don't expose internal errors in production
  const message = env.isProduction ? 'Internal server error' : (error instanceof Error ? error.message : 'Internal server error');
  response.status(500).json({ message });
};