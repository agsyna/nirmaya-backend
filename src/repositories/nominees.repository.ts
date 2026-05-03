import { eq } from 'drizzle-orm';
import { db } from '../db';
import { nominees } from '../schema';
import type { NewNominee } from '../schema/nominees';

/**
 * Nominees Repository
 * Handles all database queries related to patient nominees
 */

export const getNomineesByPatientId = async (patientId: string) => {
  return db
    .select()
    .from(nominees)
    .where(eq(nominees.patientId, patientId))
    .orderBy(nominees.createdAt);
};

export const getNomineeById = async (nomineeId: string) => {
  const [nominee] = await db
    .select()
    .from(nominees)
    .where(eq(nominees.nomineeId, nomineeId))
    .limit(1);
  return nominee ?? null;
};

export const createNominee = async (data: NewNominee) => {
  const [nominee] = await db.insert(nominees).values(data).returning();
  return nominee;
};

export const updateNominee = async (
  nomineeId: string,
  data: Partial<Pick<NewNominee, 'name' | 'email'>>
) => {
  const [nominee] = await db
    .update(nominees)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(nominees.nomineeId, nomineeId))
    .returning();
  return nominee ?? null;
};
