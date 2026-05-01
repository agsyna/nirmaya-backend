import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

let pool: Pool | null = null;
let dbInstance: any = null;

/**
 * Lazy initialization - only creates the pool when a query is actually made
 * This prevents hanging on module import in Vercel serverless
 */
function ensurePool() {
  if (pool) return;

  // Skip if DATABASE_URL is invalid
  if (!env.databaseUrl || env.databaseUrl === 'MISSING_DATABASE_URL') {
    console.warn('[DB] Skipping pool creation - DATABASE_URL not set');
    return;
  }

  console.log('[DB] Creating pool on first use...');

  pool = new Pool({
    connectionString: env.databaseUrl,
    max: env.isProduction ? 2 : 20,
    min: 0,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 1500,
    statement_timeout: 5000,
    query_timeout: 5000,
    application_name: 'nirmaya_backend',
    keepAlive: true,
  });

  pool.on('error', (err) => {
    console.error('[DB] Pool error:', err.message);
  });

  dbInstance = drizzle(pool, { schema });

  if (!env.isProduction) {
    process.on('SIGINT', () => {
      if (pool) {
        pool.end().catch(e => console.error('[DB] Shutdown error:', e));
      }
    });
  }
}

/**
 * Get or create the drizzle db instance
 */
export function getDb() {
  ensurePool();
  return dbInstance;
}

/**
 * Proxy that ensures pool exists before accessing db methods
 */
export const db = new Proxy({}, {
  get(target, prop: string | symbol) {
    ensurePool();

    if (!dbInstance) {
      // Database not available, return a safe no-op
      console.warn('[DB] Database instance not available');
      return undefined;
    }

    const value = (dbInstance as any)[prop];

    // If it's a method, wrap it to ensure pool exists
    if (typeof value === 'function') {
      return function (...args: any[]) {
        ensurePool();
        if (!dbInstance) {
          throw new Error('[DB] Database connection not available');
        }
        return (value as any).apply(dbInstance, args);
      };
    }

    return value;
  },
}) as any;
