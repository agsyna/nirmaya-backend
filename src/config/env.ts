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
const nodeEnv = process.env.NODE_ENV ?? 'development';

// In production, JWT_SECRET and DATABASE_URL MUST be explicitly set
if (!isDevelopment) {
  getEnv('JWT_SECRET'); // Validate it exists
  getEnv('DATABASE_URL'); // Validate it exists
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: isDevelopment ? 'dev-jwt-secret-only-for-local-testing' : getEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: isDevelopment 
    ? getEnv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/nirmaya_db')
    : getEnv('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN ?? (isDevelopment ? 'http://localhost:3000' : ''),
  baseUrl: process.env.BASE_URL ?? (isDevelopment ? 'http://localhost:3000' : getEnv('BASE_URL')),
  isProduction: nodeEnv === 'production',
};