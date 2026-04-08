import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/appError';

export const validateBody = (schema: ZodTypeAny) => (request: Request, _response: Response, next: NextFunction) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    next(new AppError(400, 'Validation failed', result.error.flatten()));
    return;
  }

  request.body = result.data;
  next();
};