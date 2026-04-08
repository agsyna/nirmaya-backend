import { Router } from 'express';
import v1Router from './v1';

export const apiRouter = Router();

/**
 * API Versioning
 * All routes are under /api/v1/
 * Future versions can be added as /api/v2/, etc
 */
apiRouter.use('/v1', v1Router);