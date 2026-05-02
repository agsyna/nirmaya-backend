import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const notFound = (_request: Request, response: Response) => {
  response.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (error: unknown, request: Request, response: Response, _next: NextFunction) => {
  // Prevent double response
  if (response.headersSent) {
    console.error('[ERROR HANDLER] Headers already sent, cannot send error response:', error);
    return;
  }

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

  // Drizzle wraps SQL failures with "Failed query"; return a safe message to clients.
  if (error instanceof Error && error.message.includes('Failed query:')) {
    const isSchemaIssue = /column .* does not exist|relation .* does not exist|does not exist/i.test(error.message);
    response.status(500).json({
      message: isSchemaIssue
        ? 'Database schema is out of sync. Run database migrations and try again.'
        : 'Database query failed',
    });
    return;
  }

  // Don't expose internal errors in production
  const message = env.isProduction ? 'Internal server error' : (error instanceof Error ? error.message : 'Internal server error');
  response.status(500).json({ message });
};