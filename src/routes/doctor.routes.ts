import { Router } from 'express';
import { authenticate, requireDoctor } from '../middlewares/auth';
import {
  createAccessRequestController,
  getDoctorAccessRequestsController,
} from '../controllers/accessRequests.controller';

export const doctorRouter = Router();

// All doctor routes require authentication and 'doctor' role
doctorRouter.use(authenticate, requireDoctor);

// Access Requests
doctorRouter.post('/access-request', createAccessRequestController);
doctorRouter.get('/access-requests', getDoctorAccessRequestsController);
