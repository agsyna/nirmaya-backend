import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

let pool: Pool | null = null;
let dbInstance: any = null;

export function initializeDb() {
  if (pool) return dbInstance;

  console.log('[DB] Initializing pool...');
  
  try {
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

    if (!env.isProduction) {
      process.on('SIGINT', () => {
        if (pool) pool.end().catch(e => console.error('[DB] Close error:', e));
      });
    }

    dbInstance = drizzle(pool, { schema });
    console.log('[DB] Pool initialized');
    return dbInstance;
  } catch (error) {
    console.error('[DB] Init error:', error);
    throw error;
  }
}

// Lazy getter - initialize on first access
let initialized = false;

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!initialized) {
      initialized = true;
      try {
        initializeDb();
      } catch (e) {
        console.error('[DB] Failed to init:', e);
      }
    }
    return dbInstance?.[prop as string];
  }
});
