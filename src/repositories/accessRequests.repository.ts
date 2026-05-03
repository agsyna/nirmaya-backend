import { eq, and, desc, ne } from 'drizzle-orm';
import { db } from '../db';
import { accessRequests } from '../schema';
import type { AccessRequest } from '../schema';


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
  data: Partial<AccessRequest>
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
  return db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.patientId, patientId))
    .orderBy(desc(accessRequests.createdAt));
};

export const getAccessRequestsByDoctor = async (doctorId: string) => {
  return db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.doctorId, doctorId))
    .orderBy(desc(accessRequests.createdAt));
};
