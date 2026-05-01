import serverless from 'serverless-http';
import { app } from '../src/app';
import { env } from '../src/config/env';

console.log('[INIT] Starting serverless handler initialization...');

// Startup validation
const missingVars = [];
if (env.isProduction) {
  if (env.databaseUrl === 'MISSING_DATABASE_URL') missingVars.push('DATABASE_URL');
  if (env.jwtSecret === 'MISSING_JWT_SECRET') missingVars.push('JWT_SECRET');
}

if (missingVars.length > 0) {
  console.error(`\n STARTUP ERROR: Missing environment variables:\n   ${missingVars.join('\n   ')}\n`);
}

// CRITICAL: Set aggressive request timeout BEFORE wrapping with serverless-http
app.use((req, res, next) => {
  const timeoutHandle = setTimeout(() => {
    if (!res.headersSent) {
      console.error('[TIMEOUT] Request timeout after 20 seconds:', req.method, req.path);
      res.status(503).json({ 
        error: 'Request timeout', 
        message: 'The server took too long to respond'
      });
    }
  }, 20000); // 20 second hard timeout

  // Clean up timeout if response completes
  res.on('finish', () => clearTimeout(timeoutHandle));
  res.on('close', () => clearTimeout(timeoutHandle));

  next();
});

// Handle timeout errors
app.use((err: any, _req: any, res: any, next: any) => {
  if (err.code === 'ETIMEDOUT' || err.code === 'EHOSTUNREACH') {
    console.error('[TIMEOUT]', err.message);
    if (!res.headersSent) {
      return res.status(503).json({ 
        error: 'Request timeout', 
        message: 'The server took too long to respond' 
      });
    }
  }
  next(err);
});

const handler = serverless(app);

console.log('[INIT] Serverless handler initialized successfully');

// Wrapper with emergency timeout (15 seconds total)
export default async (req: any, res: any) => {
  const startTime = Date.now();
  
  const timeoutId = setTimeout(() => {
    const elapsed = Date.now() - startTime;
    console.error(`[EMERGENCY TIMEOUT] Function exceeded 15 seconds (${elapsed}ms)`);
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'Service timeout',
        duration: elapsed 
      });
    }
  }, 15000);

  try {
    return await handler(req, res);
  } finally {
    clearTimeout(timeoutId);
  }
};