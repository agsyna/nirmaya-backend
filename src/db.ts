import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from './config/env';

// Lazy connection pool initialization - don't connect until first use
let pool: Pool | null = null;
let dbInstance: any = null;

function getPool() {
  if (pool) return pool;

  console.log('[DB] Initializing connection pool...');
  
  pool = new Pool({
    connectionString: env.databaseUrl,
    max: env.isProduction ? 2 : 20,
    min: 0,  // No persistent connections
    idleTimeoutMillis: env.isProduction ? 5000 : 10000,
    connectionTimeoutMillis: 1500,  // Aggressive timeout
    statement_timeout: 5000,        // Per statement timeout
    query_timeout: 5000,
    application_name: 'nirmaya_backend',
    keepAlive: true,
  });

  pool.on('error', (err) => {
    console.error('[DB] Pool error:', err.message);
  });

  pool.on('connect', () => {
    console.log('[DB] New connection established');
  });

  // Graceful shutdown for local development only
  if (!env.isProduction && typeof process !== 'undefined') {
    process.on('SIGINT', () => {
      if (pool) {
        pool.end().catch(err => console.error('[DB] Error closing pool:', err));
      }
    });
  }

  dbInstance = drizzle(pool, { schema });
  return pool;
}

export function getDb() {
  getPool();
  return dbInstance;
}

// For backward compatibility with existing imports
export const db = new Proxy({}, {
  get: (target, prop) => {
    return getDb()[prop as keyof typeof dbInstance];
  }
}) as any;
