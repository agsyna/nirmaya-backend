import { Router } from 'express';
import { forgotPasswordController, loginController, registerPatientController, resetPasswordController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { forgotPasswordSchema, loginSchema, registerPatientSchema, resetPasswordSchema } from '../validators/auth.validators';

export const authRouter = Router();

authRouter.post('/register/patient', validateBody(registerPatientSchema), registerPatientController);
authRouter.post('/login', validateBody(loginSchema), loginController);
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPasswordController);
authRouter.post('/reset-password', validateBody(resetPasswordSchema), resetPasswordController);