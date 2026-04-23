import { Router } from 'express';
import { registerDoctorController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { registerDoctorSchema } from '../validators/auth.validators';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

/**
 * @swagger
 * /api/v1/admin/doctors:
 *   post:
 *     summary: Register a new doctor
 *     description: Admin-only endpoint to register a new doctor user. This grants doctor access permissions.
 *     tags:
 *       - Admin - Doctor Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - specialization
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Invalid input or email already exists
 *       401:
 *         description: Unauthorized - admin access required
 *       403:
 *         description: Forbidden - not an admin user
 */
adminRouter.post('/doctors', validateBody(registerDoctorSchema), registerDoctorController);