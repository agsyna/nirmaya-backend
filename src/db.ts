import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

// Create connection pool with minimal initialization
// Don't validate connection on creation to avoid hanging on Vercel cold starts
const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.isProduction ? 5 : 20,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 3000,
  statement_timeout: 10000,
  application_name: 'nirmaya_backend',
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message);
});

// Graceful shutdown for local development only
if (!env.isProduction && typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    pool.end().catch(err => console.error('[DB] Error closing pool:', err));
  });
}

export const db = drizzle(pool, { schema });
