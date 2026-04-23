import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

// Serverless-optimized connection pool
// Uses PgBouncer or similar for connection pooling in production
const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.isProduction ? 5 : 20, // Further reduced for serverless cold starts
  idleTimeoutMillis: 10000, // Reduced idle timeout
  connectionTimeoutMillis: 2000, // Reduced connection timeout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

export const db = drizzle(pool, { schema });
