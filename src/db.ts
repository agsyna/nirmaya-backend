import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

// Create connection pool with Vercel serverless optimizations
// Reduce pool size for serverless to avoid connection limits
// Set aggressive timeouts to prevent hanging connections
const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.isProduction ? 2 : 20,  // Reduced from 5 to 2 for Vercel
  min: env.isProduction ? 0 : 1,   // No persistent connections in production
  idleTimeoutMillis: env.isProduction ? 5000 : 10000,  // Shorter idle timeout for Vercel
  connectionTimeoutMillis: 2000,    // Reduced from 3000 to 2000
  statement_timeout: 8000,          // Reduced from 10000 to 8000
  query_timeout: 8000,              // Add explicit query timeout
  application_name: 'nirmaya_backend',
  // Vercel specific: prevent connection from hanging
  keepAlive: true,
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
