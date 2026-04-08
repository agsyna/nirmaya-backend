import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

// Serverless-optimized connection pool
// Uses PgBouncer or similar for connection pooling in production
const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.isProduction ? 10 : 20, // Reduced for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
