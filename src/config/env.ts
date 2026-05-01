import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // Log error but don't throw - let app start so we can debug
    console.error(`Missing required environment variable: ${key}`);
    return '';
  }
  return value;
};

const isDevelopment = process.env.NODE_ENV === 'development';
const nodeEnv = process.env.NODE_ENV ?? 'development';

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const databaseUrl = process.env.DATABASE_URL || (isDevelopment ? 'postgresql://postgres:password@localhost:5432/nirmaya_db' : '');

const databaseDirectUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || databaseUrl;

const isSupabaseConnection = /supabase\.com/i.test(databaseUrl);

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: isDevelopment ? 'dev-jwt-secret-only-for-local-testing' : (getEnv('JWT_SECRET') || 'MISSING_JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: databaseUrl || 'MISSING_DATABASE_URL',
  databaseDirectUrl: databaseDirectUrl || 'MISSING_DATABASE_URL',
  dbSslEnabled: parseBoolean(process.env.DB_SSL_ENABLED, isSupabaseConnection),
  corsOrigin: process.env.CORS_ORIGIN ?? (isDevelopment ? 'http://localhost:3000' : ''),
  baseUrl: process.env.BASE_URL ?? (isDevelopment ? 'http://localhost:3000' : getEnv('BASE_URL')),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  supabaseBucket: process.env.SUPABASE_BUCKET ?? 'medical-records',
  isProduction: nodeEnv === 'production',
};