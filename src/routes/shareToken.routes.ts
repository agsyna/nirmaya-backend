import { Router } from 'express';
import { authenticate, requirePatient } from '../middlewares/auth';
import { validateShareTokenMiddleware } from '../middlewares/shareToken';
import {
  createShareTokenController,
  getShareTokensController,
  revokeShareTokenController,
  accessSharedDataController,
} from '../controllers/shareToken.controller';

export const shareTokenRouter = Router();

// Private routes - require patient authentication
shareTokenRouter.post('/share-tokens', authenticate, requirePatient, createShareTokenController);
shareTokenRouter.get('/share-tokens', authenticate, requirePatient, getShareTokensController);
shareTokenRouter.delete('/share-tokens/:tokenId', authenticate, requirePatient, revokeShareTokenController);

// Public route - access shared data via token (no auth required)
shareTokenRouter.post('/share/:token/access', validateShareTokenMiddleware, accessSharedDataController);
