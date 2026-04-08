import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../schema';
import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../lib/jwt';

export const authenticate = async (request: Request, _response: Response, next: NextFunction) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'Missing bearer token'));
    return;
  }

  try {
    const token = authorization.slice(7).trim();
    const payload = verifyAccessToken(token);

    const [user] = await db
      .select({ userId: users.userId, email: users.email, role: users.type })
      .from(users)
      .where(eq(users.userId, payload.userId))
      .limit(1);

    if (!user) {
      next(new AppError(401, 'Invalid token user'));
      return;
    }

    request.auth = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};

export const requireAdmin = (request: Request, _response: Response, next: NextFunction) => {
  if (request.auth?.role !== 'admin') {
    next(new AppError(403, 'Admin access required'));
    return;
  }

  next();
};

export const requireDoctor = (request: Request, _response: Response, next: NextFunction) => {
  if (request.auth?.role !== 'doctor') {
    next(new AppError(403, 'Doctor access required'));
    return;
  }

  next();
};

export const requirePatient = (request: Request, _response: Response, next: NextFunction) => {
  if (request.auth?.role !== 'patient') {
    next(new AppError(403, 'Patient access required'));
    return;
  }

  next();
};