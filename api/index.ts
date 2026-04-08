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

export default serverless(app);