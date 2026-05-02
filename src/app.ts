import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { env } from './config/env';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { db, hasDbError } from './db';
import { sql } from 'drizzle-orm';
import { getSupabaseAdmin } from './lib/supabase';

export const app = express();

app.use(helmet());

const allowedOrigins = env.corsOrigin.split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// Set request timeout to prevent indefinite hangs (25s, leaving 5s buffer for Vercel 30s limit)
app.use((req, res, next) => {
  req.setTimeout(25000);
  res.setTimeout(25000);
  next();
});

const morganFormat = env.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Check for critical missing environment variables before processing requests
app.use((_req, res, next): void => {
  if (env.isProduction) {
    const missingVars = [];
    if (env.databaseUrl === 'MISSING_DATABASE_URL') {
      missingVars.push('DATABASE_URL');
    }
    if (env.jwtSecret === 'MISSING_JWT_SECRET') {
      missingVars.push('JWT_SECRET');
    }

    if (missingVars.length > 0) {
      console.error('[ENV] Missing critical vars:', missingVars);
      res.status(503).json({
        error: 'Service misconfigured',
        message: 'Required environment variables are not set',
        missing: missingVars
      });
      return;
    }
  }
  next();
});

// Lazy-load Swagger specs on first request to avoid cold start timeout
let swaggerSpecs: any = null;
let swaggerError: Error | null = null;

const getSwaggerSpecs = () => {
  if (swaggerSpecs || swaggerError) {
    if (swaggerError) throw swaggerError;
    return swaggerSpecs;
  }

  try {
    const swaggerApiGlobs = env.isProduction
      ? ['./dist/src/routes/**/*.js', './dist/src/controllers/**/*.js']
      : ['./src/routes/**/*.ts', './src/controllers/**/*.ts'];

    swaggerSpecs = swaggerJsdoc({
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Nirmaya Medical Records API',
          version: '1.0.0',
          description: 'Medical records management system API',
        },
        servers: [
          {
            url: env.baseUrl || 'http://localhost:3000',
            description: 'API Server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: swaggerApiGlobs,
    });
    console.log('[SWAGGER] Specs generated successfully');
  } catch (error) {
    swaggerError = error instanceof Error ? error : new Error('Unknown swagger error');
    console.error('[SWAGGER] Failed to generate specs:', swaggerError.message);
  }

  return swaggerSpecs || {};
};

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 environment:
 *                   type: string
 *                   example: production
 *                 timestamp:
 *                   type: string
 *       503:
 *         description: API unhealthy (missing env vars)
 */
app.use('/api-docs', swaggerUi.serve, (req: any, res: any, next: any) => swaggerUi.setup(getSwaggerSpecs())(req, res, next));

app.get('/health', async (_request, response) => {
  const missingVars = [];
  if (env.isProduction) {
    if (env.databaseUrl === 'MISSING_DATABASE_URL') missingVars.push('DATABASE_URL');
    if (env.jwtSecret === 'MISSING_JWT_SECRET') missingVars.push('JWT_SECRET');
  }
  
  if (missingVars.length > 0) {
    response.status(503).json({ 
      status: 'error',
      message: 'Missing environment variables',
      data: {
        status: 'unhealthy',
        missing: missingVars,
        timestamp: new Date().toISOString(),
      }
    });
    return;
  }

  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbError = null;
  let dbLatency = 0;

  // Check database connection with timeout
  try {
    if (hasDbError()) {
      dbStatus = 'disconnected';
      dbError = 'Database initialization failed';
    } else {
      const dbStart = Date.now();
      // Use Promise.race to enforce timeout on DB check
      await Promise.race([
        db.execute(sql`SELECT 1`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]);
      dbLatency = Date.now() - dbStart;
      dbStatus = 'connected';
    }
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error instanceof Error ? error.message : 'Unknown database error';
  }

  // Check Supabase connection
  let supabaseStatus = 'disconnected';
  let supabaseError = null;
  let supabaseLatency = 0;

  try {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      supabaseStatus = 'not-configured';
    } else {
      const supabaseStart = Date.now();
      const supabase = getSupabaseAdmin();
      // Test storage bucket access
      await supabase.storage.listBuckets();
      supabaseLatency = Date.now() - supabaseStart;
      supabaseStatus = 'connected';
    }
  } catch (error) {
    supabaseStatus = 'disconnected';
    supabaseError = error instanceof Error ? error.message : 'Unknown Supabase error';
  }

  const responseTime = Date.now() - startTime;
  const isHealthy = dbStatus === 'connected' && (supabaseStatus === 'connected' || supabaseStatus === 'not-configured');

  response.status(isHealthy ? 200 : 503).json({ 
    status: 'success',
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.nodeEnv,
      uptime: process.uptime(),
      responseTime,
      database: {
        status: dbStatus,
        latency: dbLatency,
        error: dbError
      },
      supabase: {
        status: supabaseStatus,
        latency: supabaseLatency,
        error: supabaseError
      }
    }
  });
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;