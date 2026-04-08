import { and, eq, gt } from 'drizzle-orm';
import { db } from '../db';
import { doctors, patients, users } from '../schema';
import { AppError } from '../utils/appError';
import { comparePassword, hashPassword } from '../lib/password';
import { createResetToken, hashResetToken } from '../lib/token';
import { signAccessToken } from '../lib/jwt';

type RegisterPatientInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
};

type RegisterDoctorInput = RegisterPatientInput & {
  specialization:
    | 'cardiology'
    | 'dermatology'
    | 'endocrinology'
    | 'ent'
    | 'family_medicine'
    | 'gastroenterology'
    | 'general_medicine'
    | 'gynecology'
    | 'neurology'
    | 'oncology'
    | 'ophthalmology'
    | 'orthopedics'
    | 'pediatrics'
    | 'psychiatry'
    | 'radiology'
    | 'urology'
    | 'other';
  licenseNumber: string;
  bio?: string;
  verified?: boolean;
};

const sanitizeUser = <T extends { password: string; passwordResetTokenHash?: string | null; passwordResetTokenExpiresAt?: Date | null }>(user: T) => {
  const { password, passwordResetTokenHash, passwordResetTokenExpiresAt, ...rest } = user;
  return rest;
};

export const registerPatient = async (input: RegisterPatientInput) => {
  const existingUser = await db.select({ userId: users.userId }).from(users).where(eq(users.email, input.email)).limit(1);

  if (existingUser.length > 0) {
    throw new AppError(409, 'Email already in use');
  }

  const password = await hashPassword(input.password);

  const created = await db.transaction(async (transaction) => {
    const [user] = await transaction
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password,
        phone: input.phone,
        age: input.age,
        gender: input.gender,
        type: 'patient',
      })
      .returning();

    const [patient] = await transaction
      .insert(patients)
      .values({
        userId: user.userId,
        bloodGroup: input.bloodGroup,
      })
      .returning();

    return { user, patient };
  });

  const token = signAccessToken({
    userId: created.user.userId,
    email: created.user.email,
    role: 'patient',
  });

  return {
    user: sanitizeUser(created.user),
    patient: created.patient,
    token,
  };
};

export const registerDoctor = async (input: RegisterDoctorInput) => {
  const existingUser = await db.select({ userId: users.userId }).from(users).where(eq(users.email, input.email)).limit(1);

  if (existingUser.length > 0) {
    throw new AppError(409, 'Email already in use');
  }

  const password = await hashPassword(input.password);

  const created = await db.transaction(async (transaction) => {
    const [user] = await transaction
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password,
        phone: input.phone,
        age: input.age,
        gender: input.gender,
        type: 'doctor',
      })
      .returning();

    const [doctor] = await transaction
      .insert(doctors)
      .values({
        userId: user.userId,
        specialization: input.specialization,
        licenseNumber: input.licenseNumber,
        bio: input.bio,
        verified: input.verified ?? false,
      })
      .returning();

    return { user, doctor };
  });

  const token = signAccessToken({
    userId: created.user.userId,
    email: created.user.email,
    role: 'doctor',
  });

  return {
    user: sanitizeUser(created.user),
    doctor: created.doctor,
    token,
  };
};

export const login = async (email: string, passwordValue: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const passwordMatches = await comparePassword(passwordValue, user.password);

  if (!passwordMatches) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = signAccessToken({
    userId: user.userId,
    email: user.email,
    role: user.type,
  });

  // Fetch patient data if user is a patient
  let patientData = null;
  if (user.type === 'patient') {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, user.userId)).limit(1);
    if (patient) {
      patientData = {
        patientId: patient.patientId,
        bloodGroup: patient.bloodGroup,
        height: patient.height,
        weight: patient.weight,
        emergencySosEnabled: patient.emergencySosEnabled,
      };
    }
  }

  return {
    user: {
      ...sanitizeUser(user),
      userId: user.userId,
      email: user.email,
      name: user.name,
      age: user.age,
      gender: user.gender,
      phone: user.phone,
      type: user.type,
    },
    patient: patientData,
    qrCode: patientData ? {
      code: `https://health-app.com/qr/${patientData.patientId}`, // Placeholder - can be replaced with actual QR code generation
      generatedAt: new Date(),
    } : null,
    token,
  };
};

export const forgotPassword = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { message: 'If the email exists, a reset token was generated' };
  }

  const token = createResetToken();
  const tokenHash = hashResetToken(token);

  await db
    .update(users)
    .set({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
      updatedAt: new Date(),
    })
    .where(eq(users.userId, user.userId));

  return {
    message: 'Reset token generated',
    resetToken: token,
  };
};

export const resetPassword = async (token: string, passwordValue: string) => {
  const tokenHash = hashResetToken(token);

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.passwordResetTokenHash, tokenHash), gt(users.passwordResetTokenExpiresAt, new Date())))
    .limit(1);

  if (!user) {
    throw new AppError(400, 'Invalid or expired reset token');
  }

  const password = await hashPassword(passwordValue);

  await db
    .update(users)
    .set({
      password,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.userId, user.userId));

  return { message: 'Password reset successful' };
};