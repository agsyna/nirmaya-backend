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

/**
 * @swagger
 * /api/v1/share-tokens:
 *   post:
 *     summary: Create a share token
 *     description: Generate a new share token to allow others to access your medical data
 *     tags:
 *       - Data Sharing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientEmail
 *               - expiresIn
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               expiresIn:
 *                 type: number
 *                 description: Token expiration time in minutes
 *               accessLevel:
 *                 type: string
 *                 enum: [read, write]
 *                 default: read
 *     responses:
 *       201:
 *         description: Share token created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all share tokens
 *     description: Retrieve all active share tokens created by the current patient
 *     tags:
 *       - Data Sharing
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Share tokens retrieved successfully
 *       401:
 *         description: Unauthorized
 */
shareTokenRouter.post('/share-tokens', authenticate, requirePatient, createShareTokenController);
shareTokenRouter.get('/share-tokens', authenticate, requirePatient, getShareTokensController);

/**
 * @swagger
 * /api/v1/share-tokens/{tokenId}:
 *   delete:
 *     summary: Revoke a share token
 *     description: Revoke/deactivate a share token to prevent further access
 *     tags:
 *       - Data Sharing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share token revoked successfully
 *       404:
 *         description: Share token not found
 *       401:
 *         description: Unauthorized
 */
shareTokenRouter.delete('/share-tokens/:tokenId', authenticate, requirePatient, revokeShareTokenController);

// Public route - access shared data via token (no auth required)

/**
 * @swagger
 * /api/v1/share/{token}/access:
 *   post:
 *     summary: Access shared medical data
 *     description: Access patient's medical data using a valid share token (no authentication required)
 *     tags:
 *       - Data Sharing
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Valid share token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessorEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Shared data accessed successfully
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Access denied
 */
shareTokenRouter.post('/share/:token/access', validateShareTokenMiddleware, accessSharedDataController);
