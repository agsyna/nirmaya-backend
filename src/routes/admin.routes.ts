import { Router } from 'express';
import {
  deletePatientAdminController,
  getPatientAdminController,
  listPatientsAdminController,
  registerDoctorController,
  updatePatientAdminController,
} from '../controllers/admin.controller';
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
 *               - name
 *               - email
 *               - password
 *               - specialization
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
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

/**
 * @swagger
 * /api/v1/admin/patients:
 *   get:
 *     summary: List patients
 *     description: Admin-only endpoint to list all patients with basic profile data.
 *     tags:
 *       - Admin - Patient Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
adminRouter.get('/patients', listPatientsAdminController);

/**
 * @swagger
 * /api/v1/admin/patients/{patientId}:
 *   get:
 *     summary: Get patient details
 *     description: Admin-only endpoint to fetch full patient profile details.
 *     tags:
 *       - Admin - Patient Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       404:
 *         description: Patient not found
 *   put:
 *     summary: Update patient details
 *     description: Admin-only endpoint to update patient profile fields.
 *     tags:
 *       - Admin - Patient Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               bloodGroup:
 *                 type: string
 *               emergencySosEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 *   delete:
 *     summary: Delete patient
 *     description: Admin-only endpoint to delete a patient account.
 *     tags:
 *       - Admin - Patient Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 */
adminRouter.get('/patients/:patientId', getPatientAdminController);
adminRouter.put('/patients/:patientId', updatePatientAdminController);
adminRouter.delete('/patients/:patientId', deletePatientAdminController);