import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { env } from './config/env';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';


export const app = express();

app.use(helmet());

const allowedOrigins = env.corsOrigin.split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

const morganFormat = env.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Lazy-load Swagger specs on first request to avoid cold start timeout
let swaggerSpecs: any = null;
const getSwaggerSpecs = () => {
  if (!swaggerSpecs) {
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
      apis: [
        './dist/src/routes/**/*.js',
        './dist/src/controllers/**/*.js',
      ],
    });
  }
  return swaggerSpecs;
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