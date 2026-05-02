import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

let pool: Pool | null = null;
let dbInstance: any = null;
let dbError: Error | null = null;
let shutdownHandlerRegistered = false;

/**
 * Lazy initialization - only creates the pool when a query is actually made
 * This prevents hanging on module import in Vercel serverless
 */
function ensurePool() {
  if (pool || dbError) return;

  // Skip if DATABASE_URL is invalid
  if (!env.databaseUrl || env.databaseUrl === 'MISSING_DATABASE_URL') {
    dbError = new Error('[DB] DATABASE_URL not configured');
    console.warn('[DB]', dbError.message);
    return;
  }

  console.log('[DB] Creating pool with connectionString:', env.databaseUrl.substring(0, 50) + '...');

  try {
    const useSsl = env.dbSslEnabled || env.isProduction; // Force SSL in production

    pool = new Pool({
      connectionString: env.databaseUrl,
      max: env.isProduction ? 2 : 5,
      min: 0,
      idleTimeoutMillis: 30000, // 30s idle timeout (prevent premature closure)
      connectionTimeoutMillis: 5000, // Allow 5s to connect to remote Supabase
      statement_timeout: 8000, // 8s per query
      query_timeout: 8000,
      application_name: 'nirmaya_backend',
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('[DB] Pool error:', err.message);
      dbError = err;
    });

    pool.on('connect', () => {
      console.log('[DB] Connection established');
    });

    pool.on('acquire', () => {
      console.log('[DB] Connection acquired from pool');
    });

    dbInstance = drizzle(pool, { schema });
    console.log('[DB] Pool created successfully');

    // Register shutdown handlers
    if (!shutdownHandlerRegistered) {
      shutdownHandlerRegistered = true;

      // Standard process termination
      const cleanup = async () => {
        if (pool && !pool.ending) {
          try {
            await pool.end();
            console.log('[DB] Pool closed gracefully');
          } catch (e) {
            if (!(e instanceof Error && e.message.includes('more than once'))) {
              console.error('[DB] Shutdown error:', e);
            }
          }
        }
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    }
  } catch (error) {
    console.error('[DB] Pool creation error:', error);
    dbError = error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Check if database error exists
 */
export function hasDbError() {
  return !!dbError;
}

/**
 * Proxy that safely handles database access
 */
export const db = new Proxy({}, {
  get(_target, prop: string | symbol) {
    // If database failed to initialize, return safe no-ops
    if (dbError && !dbInstance) {
      console.warn('[DB] Database unavailable:', dbError.message);
      if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete') {
        return () => {
          throw new Error('[DB] Database connection not available');
        };
      }
      return undefined;
    }

    // Try to ensure pool on first access
    if (!pool && !dbError) {
      ensurePool();
    }

    if (!dbInstance) {
      return undefined;
    }

    const value = (dbInstance as any)[prop];

    if (typeof value === 'function') {
      return function (...args: any[]) {
        if (!dbInstance) {
          throw new Error('[DB] Database connection lost');
        }
        return (value as any).apply(dbInstance, args);
      };
    }

    return value;
  },
}) as any;
