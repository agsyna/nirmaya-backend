import serverless from 'serverless-http';
import { app } from '../src/app';
import { env } from '../src/config/env';

// Startup validation
const missingVars = [];
if (env.isProduction) {
  if (env.databaseUrl === 'MISSING_DATABASE_URL') missingVars.push('DATABASE_URL');
  if (env.jwtSecret === 'MISSING_JWT_SECRET') missingVars.push('JWT_SECRET');
}

if (missingVars.length > 0) {
  console.error(`\n STARTUP ERROR: Missing environment variables:\n   ${missingVars.join('\n   ')}\n`);
}

// Set request timeout to 25 seconds (Vercel max is 30 seconds, leaving 5s buffer)
app.use((req, res, next) => {
  req.setTimeout(25000);
  res.setTimeout(25000);
  next();
});

// Handle timeout errors
app.use((err: any, _req: any, res: any, next: any) => {
  if (err.code === 'ETIMEDOUT' || err.code === 'EHOSTUNREACH') {
    console.error('[TIMEOUT]', err.message);
    return res.status(503).json({ 
      error: 'Request timeout', 
      message: 'The server took too long to respond' 
    });
  }
  next(err);
});

export default serverless(app);