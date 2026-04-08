import { Router } from 'express';
import { registerDoctorController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { registerDoctorSchema } from '../validators/auth.validators';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);
adminRouter.post('/doctors', validateBody(registerDoctorSchema), registerDoctorController);