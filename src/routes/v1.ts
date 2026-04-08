import { Router } from 'express';
import { authRouter } from './auth.routes';
import { patientRouter } from './patient.routes';
import { shareTokenRouter } from './shareToken.routes';

const v1Router = Router();

/**
 * API v1 Routes
 * All endpoints prefixed with /api/v1/
 */

// Authentication routes - public
v1Router.use('/auth', authRouter);

// Patient & Health Data routes - authenticated
v1Router.use('/patient', patientRouter);

// Share token routes - for data sharing
v1Router.use('/patient', shareTokenRouter);

// Public share access endpoint
v1Router.use('', shareTokenRouter);

export default v1Router;
