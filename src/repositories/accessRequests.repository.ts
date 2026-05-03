import { eq, and, desc, ne, inArray } from 'drizzle-orm';
import { db } from '../db';
import { accessRequests } from '../schema';
import type { AccessRequest } from '../schema';

/**
 * Lazily expire any approved requests whose expiresAt has passed.
 * Updates the DB in bulk and returns the corrected list.
 */
const expireStaleRequests = async (records: AccessRequest[]): Promise<AccessRequest[]> => {
  const now = new Date();
  const toExpire = records.filter(
    (r) => r.status === 'approved' && r.expiresAt && r.expiresAt < now
  );

  if (toExpire.length > 0) {
    const ids = toExpire.map((r) => r.id);
    await db
      .update(accessRequests)
      .set({ status: 'expired', updatedAt: now })
      .where(inArray(accessRequests.id, ids));

    // Patch in-memory objects so the caller gets the correct status immediately
    const expiredSet = new Set(ids);
    return records.map((r) =>
      expiredSet.has(r.id) ? { ...r, status: 'expired' as const, updatedAt: now } : r
    );
  }

  return records;
};


export const createAccessRequest = async (data: {
  patientId: string;
  doctorId: string;
}) => {
  const requestExpiresAt = new Date();
  requestExpiresAt.setHours(requestExpiresAt.getHours() + 24);

  const [result] = await db
    .insert(accessRequests)
    .values({
      patientId: data.patientId,
      doctorId: data.doctorId,
      status: 'pending',
      requestExpiresAt,
    })
    .returning();

  return result;
};

export const getAccessRequestById = async (id: string): Promise<AccessRequest | undefined> => {
  const [request] = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.id, id))
    .limit(1);

  return request;
};

export const getActiveAccessRequestForDoctor = async (patientId: string, doctorId: string) => {
  // Check for an active approved request or a pending request that hasn't expired yet
  const [request] = await db
    .select()
    .from(accessRequests)
    .where(
      and(
        eq(accessRequests.patientId, patientId),
        eq(accessRequests.doctorId, doctorId),
        ne(accessRequests.status, 'rejected'),
        ne(accessRequests.status, 'revoked'),
        ne(accessRequests.status, 'expired')
      )
    )
    .limit(1);

  return request;
};

export const updateAccessRequest = async (
  id: string,
  data: {
    status?: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
    approvedScope?: string[];
    shareTokenId?: string | null;
    expiresAt?: Date;
  }
) => {
  const [result] = await db
    .update(accessRequests)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(accessRequests.id, id))
    .returning();

  return result;
};

export const getAccessRequestsByPatient = async (patientId: string) => {
  const records = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.patientId, patientId))
    .orderBy(desc(accessRequests.createdAt));

  return expireStaleRequests(records);
};

export const getAccessRequestsByDoctor = async (doctorId: string) => {
  const records = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.doctorId, doctorId))
    .orderBy(desc(accessRequests.createdAt));

  return expireStaleRequests(records);
};
