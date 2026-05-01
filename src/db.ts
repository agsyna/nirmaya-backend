import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

let pool: Pool | null = null;
let dbInstance: any = null;
let initError: any = null;

function createPool() {
  if (pool || dbInstance) return;

  // Prevent initialization if DATABASE_URL is missing
  if (env.databaseUrl === 'MISSING_DATABASE_URL' || !env.databaseUrl) {
    const error = new Error('[DB] Cannot initialize: DATABASE_URL is missing or invalid');
    console.error(error.message);
    initError = error;
    return;
  }

  console.log('[DB] Creating connection pool...');

  try {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: env.isProduction ? 2 : 20,
      min: 0,
      idleTimeoutMillis: env.isProduction ? 5000 : 10000,
      connectionTimeoutMillis: 1500,
      statement_timeout: 5000,
      query_timeout: 5000,
      application_name: 'nirmaya_backend',
      keepAlive: true,
    });

    pool.on('error', (err) => {
      console.error('[DB] Pool error:', err.message);
    });

    if (!env.isProduction) {
      process.on('SIGINT', () => {
        if (pool) pool.end().catch(e => console.error('[DB] Shutdown:', e));
      });
    }

    dbInstance = drizzle(pool, { schema });
    console.log('[DB] Pool initialized successfully');
  } catch (error) {
    console.error('[DB] Pool creation error:', error);
    initError = error;
  }
}

// Try to initialize on module load
try {
  createPool();
} catch (error) {
  console.error('[DB] Module load error:', error);
  initError = error;
}

// Export db with error handling
export const db = new Proxy({}, {
  get(target, prop) {
    if (initError) {
      console.warn('[DB] Database not initialized:', initError.message);
      // Return a dummy object to prevent crashes
      return undefined;
    }

    if (!dbInstance) {
      createPool();
    }

    if (dbInstance && typeof prop === 'string') {
      const value = (dbInstance as any)[prop];
      if (typeof value === 'function') {
        return function (...args: any[]) {
          if (!dbInstance) {
            throw new Error('[DB] Database not initialized');
          }
          return (value as any).apply(dbInstance, args);
        };
      }
      return value;
    }

    return undefined;
  },
}) as any;
