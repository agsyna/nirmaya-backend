import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';

export const notFound = (_request: Request, response: Response) => {
  response.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Validation failed', details: error.flatten() });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message, details: error.details });
    return;
  }

  response.status(500).json({ message: 'Internal server error' });
};