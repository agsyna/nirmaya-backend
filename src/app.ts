import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { env } from './config/env';

export const app = express();

app.use(helmet());

// CORS configuration - restrict in production
const allowedOrigins = env.corsOrigin.split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Logging - use 'combined' for production
const morganFormat = env.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

app.get('/health', (_request, response) => {
  const missingVars = [];
  if (env.isProduction) {
    if (env.databaseUrl === 'MISSING_DATABASE_URL') missingVars.push('DATABASE_URL');
    if (env.jwtSecret === 'MISSING_JWT_SECRET') missingVars.push('JWT_SECRET');
  }
  
  if (missingVars.length > 0) {
    response.status(503).json({ 
      status: 'unhealthy',
      message: 'Missing environment variables',
      missing: missingVars,
      timestamp: new Date().toISOString() 
    });
  } else {
    response.status(200).json({ 
      status: 'ok',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString() 
    });
  }
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;