import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const isDevelopment = process.env.NODE_ENV === 'development';

// In production, these must be explicitly set
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: isDevelopment ? 'dev-jwt-secret-change-me' : getEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: isDevelopment ? 'postgresql://user:password@localhost:5432/nirmaya_db' : getEnv('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
};