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

// Request timeout for serverless environment (30s Vercel limit)
app.use((req, res, next) => {
  req.setTimeout(25000); // 25s to allow Vercel buffer
  res.setTimeout(25000);
  next();
});

// Logging - use 'combined' for production
const morganFormat = env.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;