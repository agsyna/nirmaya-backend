import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthRole } from '../types/express';
import type { SignOptions } from 'jsonwebtoken';

export type JwtPayload = {
  userId: string;
  email: string;
  role: AuthRole;
};

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] });

export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload;