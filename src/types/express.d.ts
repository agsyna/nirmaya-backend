import 'express';

export type AuthRole = 'admin' | 'doctor' | 'patient';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        role: AuthRole;
      };
      shareToken?: {
        tokenId: string;
        patientId: string;
        scope: string[];
        doctorId: string | null;
        accessLevel: 'public' | 'doctor';
        maxAccesses: number;
        currentAccesses: number;
      };
    }
  }
}

export {};