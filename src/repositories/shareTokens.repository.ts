import { eq, and, or, isNull, desc, ne, sql } from 'drizzle-orm';
import { db } from '../db';
import { shareTokens } from '../schema';
import type { ShareToken } from '../schema';
import { AppError } from '../utils/appError';
import crypto from 'crypto';

/**
 * Share Tokens Repository
 * Handles all database queries related to share tokens for data sharing
 */

/**
 * Hash a token for secure storage
 */
export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a secure random token
 */
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new share token
 */
export const createShareToken = async (data: {
  patientId: string;
  doctorId?: string; // null for public access
  scope: string[];
  accessLevel: 'public' | 'doctor';
  maxAccesses?: number;
  expiresAt?: Date;
}) => {
  const token = generateToken();
  const tokenHash = hashToken(token);

  const [result] = await db
    .insert(shareTokens)
    .values({
      patientId: data.patientId,
      doctorId: data.doctorId || null,
      tokenHash,
      scope: data.scope,
      accessLevel: data.accessLevel,
      maxAccesses: data.maxAccesses ?? -1,
      expiresAt: data.expiresAt,
      status: 'active',
    })
    .returning();

  if (!result) {
    throw new AppError(500, 'Failed to create share token');
  }

  // Return token with the actual token value (only shown once)
  return {
    ...result,
    token, // Only return plaintext token once at creation
  };
};

/**
 * Get share token by hash
 */
export const getShareTokenByHash = async (tokenHash: string) => {
  const [token] = await db
    .select()
    .from(shareTokens)
    .where(eq(shareTokens.tokenHash, tokenHash))
    .limit(1);

  return token;
};

/**
 * Get share token by ID
 */
export const getShareTokenById = async (tokenId: string) => {
  const [token] = await db
    .select()
    .from(shareTokens)
    .where(eq(shareTokens.tokenId, tokenId))
    .limit(1);

  return token;
};

/**
 * Validate if a token is active and usable
 */
export const validateShareToken = async (
  token: string,
  doctorId?: string
) => {
  const tokenHash = hashToken(token);
  const shareToken = await getShareTokenByHash(tokenHash);

  if (!shareToken) {
    throw new AppError(401, 'Invalid or expired token');
  }

  // Check if token is revoked
  if (shareToken.status === 'revoked') {
    throw new AppError(401, 'Token has been revoked');
  }

  // Check if token is expired
  if (shareToken.expiresAt && new Date() > shareToken.expiresAt) {
    throw new AppError(401, 'Token has expired');
  }

  // Check access level - if restricted to doctor, validate doctorId matches
  if (shareToken.accessLevel === 'doctor' && shareToken.doctorId) {
    if (!doctorId || doctorId !== shareToken.doctorId) {
      throw new AppError(403, 'This token is not accessible to you');
    }
  }

  // Check access count
  if (
    shareToken.maxAccesses > 0 &&
    shareToken.currentAccesses >= shareToken.maxAccesses
  ) {
    throw new AppError(403, 'Token access limit reached');
  }

  return shareToken;
};

/**
 * Register an access to a token (increment access count)
 */
export const incrementTokenAccess = async (tokenId: string) => {
  const [result] = await db
    .update(shareTokens)
    .set({
      currentAccesses: sql`${shareTokens.currentAccesses} + 1`,
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(shareTokens.tokenId, tokenId))
    .returning();

  return result;
};

/**
 * Get all share tokens for a patient
 */
export const getShareTokensByPatient = async (
  patientId: string,
  limit: number = 50
) => {
  const tokens = await db
    .select()
    .from(shareTokens)
    .where(eq(shareTokens.patientId, patientId))
    .orderBy(desc(shareTokens.createdAt))
    .limit(limit);

  return tokens;
};

/**
 * Get active share tokens for a patient
 */
export const getActiveShareTokensByPatient = async (patientId: string) => {
  const tokens = await db
    .select()
    .from(shareTokens)
    .where(
      and(
        eq(shareTokens.patientId, patientId),
        eq(shareTokens.status, 'active'),
        or(
          isNull(shareTokens.expiresAt),
          // Token is still valid if expiresAt is in the future
          // Using raw SQL for complex comparisons
        )
      )
    )
    .orderBy(desc(shareTokens.createdAt));

  return tokens.filter((token: ShareToken) => {
    // Filter out expired tokens if expiresAt is set
    if (token.expiresAt && new Date() > token.expiresAt) {
      return false;
    }
    return true;
  });
};

/**
 * Revoke a share token
 */
export const revokeShareToken = async (
  tokenId: string,
  patientId: string,
  revokedBy: string
) => {
  const [result] = await db
    .update(shareTokens)
    .set({
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy,
      updatedAt: new Date(),
    })
    .where(
      and(eq(shareTokens.tokenId, tokenId), eq(shareTokens.patientId, patientId))
    )
    .returning();

  if (!result) {
    throw new AppError(404, 'Share token not found');
  }

  return result;
};

/**
 * Delete a share token permanently (use with caution)
 */
export const deleteShareToken = async (tokenId: string, patientId: string) => {
  const result = await db
    .delete(shareTokens)
    .where(
      and(eq(shareTokens.tokenId, tokenId), eq(shareTokens.patientId, patientId))
    );

  return result;
};

/**
 * Check if patient already has a token for a specific doctor
 */
export const getPatientDoctorToken = async (
  patientId: string,
  doctorId: string
) => {
  const [token] = await db
    .select()
    .from(shareTokens)
    .where(
      and(
        eq(shareTokens.patientId, patientId),
        eq(shareTokens.doctorId, doctorId),
        ne(shareTokens.status, 'revoked')
      )
    )
    .limit(1);

  return token;
};
