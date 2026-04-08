import type { NextFunction, Request, Response } from 'express';
import { validateShareToken, incrementTokenAccess } from '../repositories/shareTokens.repository';
import { AppError } from '../utils/appError';

/**
 * Middleware to validate share token from either:
 * 1. URL path parameter /share/:token
 * 2. Authorization Bearer token
 */
export const validateShareTokenMiddleware = async (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  try {
    // Get token from path parameter or Authorization header
    let tokenParam = request.params.token || request.headers.authorization?.replace('Bearer ', '');

    // Handle case where tokenParam might be an array
    if (Array.isArray(tokenParam)) {
      tokenParam = tokenParam[0];
    }

    if (!tokenParam) {
      throw new AppError(401, 'Share token required');
    }

    // Get doctor ID from authenticated user if available
    const doctorId = request.auth?.userId;

    // Validate the token
    const shareToken = await validateShareToken(tokenParam, doctorId);

    // Attach share token info to request
    request.shareToken = {
      tokenId: shareToken.tokenId,
      patientId: shareToken.patientId,
      scope: (shareToken.scope as string[]) || [],
      doctorId: shareToken.doctorId || null,
      accessLevel: (shareToken.accessLevel as 'public' | 'doctor') || 'doctor',
      maxAccesses: shareToken.maxAccesses || -1,
      currentAccesses: shareToken.currentAccesses || 0,
    };

    // Increment access count
    await incrementTokenAccess(shareToken.tokenId);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if doctor ID matches token's allowed doctor (if restricted)
 */
export const checkTokenDoctorAccess = (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  if (!request.shareToken) {
    next(new AppError(401, 'Share token not found'));
    return;
  }

  // If token is restricted to specific doctor and user is accessing
  if (
    request.shareToken.accessLevel === 'doctor' &&
    request.shareToken.doctorId &&
    request.auth?.userId !== request.shareToken.doctorId
  ) {
    next(new AppError(403, 'You do not have access to this token'));
    return;
  }

  next();
};
