import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let dbError: Error | null = null;

function ensurePool() {
  if (pool || dbError) return;

  if (!env.databaseUrl || env.databaseUrl === 'MISSING_DATABASE_URL') {
    dbError = new Error('[DB] DATABASE_URL not configured');
    console.warn('[DB]', dbError.message);
    return;
  }

  try {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: 1,                      // Must be 1 for pgbouncer
      min: 0,
      idleTimeoutMillis: 0,        // ← CHANGED: let pgbouncer manage lifecycle
      connectionTimeoutMillis: 8000,
      statement_timeout: 9000,
      query_timeout: 9000,
      ssl: { rejectUnauthorized: false },
      application_name: 'nirmaya_backend',
    });

    pool.on('error', (err) => {
      console.error('[DB] Pool error:', err.message);
      // ← CHANGED: reset pool so next request gets a fresh one
      pool = null;
      dbInstance = null;
      dbError = null;
    });

    dbInstance = drizzle(pool, { schema });
    console.log('[DB] Pool created successfully');

    // ← REMOVED: shutdown handlers (useless + harmful in serverless)

  } catch (error) {
    console.error('[DB] Pool creation error:', error);
    dbError = error instanceof Error ? error : new Error(String(error));
  }
}

export function hasDbError() {
  return !!dbError;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop: string | symbol) {
    if (!pool && !dbError) {
      ensurePool();
    }

    if (dbError && !dbInstance) {
      if (['select', 'insert', 'update', 'delete'].includes(prop as string)) {
        return () => { throw new Error('[DB] Database connection not available'); };
      }
      return undefined;
    }

    if (!dbInstance) return undefined;

    const value = (dbInstance as any)[prop];
    return typeof value === 'function'
      ? (...args: any[]) => (value as any).apply(dbInstance, args)
      : value;
  },
});