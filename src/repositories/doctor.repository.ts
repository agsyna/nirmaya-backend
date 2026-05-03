import { eq } from 'drizzle-orm';
import { db } from '../db';
import { doctors, users } from '../schema';

export const getDoctorByUserId = async (userId: string) => {
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.userId, userId))
    .limit(1);
  return doctor;
};

export const getDoctorWithUser = async (doctorId: string) => {
  const [data] = await db
    .select({ doctor: doctors, user: users })
    .from(doctors)
    .innerJoin(users, eq(doctors.userId, users.userId))
    .where(eq(doctors.doctorId, doctorId))
    .limit(1);
  return data;
};
