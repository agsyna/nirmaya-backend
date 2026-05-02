import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { forgotPasswordController, loginController, registerPatientController, resetPasswordController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { forgotPasswordSchema, loginSchema, registerPatientSchema, resetPasswordSchema } from '../validators/auth.validators';

export const authRouter = Router();

// Rate limiting - prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: false,
  skip: (_req) => process.env.NODE_ENV === 'development', // Skip in dev
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: false,
  skip: (_req) => process.env.NODE_ENV === 'development',
});

/**
 * @swagger
 * /api/v1/auth/register/patient:
 *   post:
 *     summary: Register a new patient
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Invalid input or email already exists
 */
authRouter.post('/register/patient', registerLimiter, validateBody(registerPatientSchema), registerPatientController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', authLimiter, validateBody(loginSchema), loginController);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (or reset token in dev)
 *       404:
 *         description: User not found
 */
authRouter.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPasswordController);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
authRouter.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPasswordController);