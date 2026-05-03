import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';

// Patient controllers
import {
  getCurrentUserController,
  getUserHealthController,
  createUserHealthRecordController,
} from '../controllers/patient.controller';

// Nominees controllers
import {
  getNomineesController,
  createNomineeController,
  updateNomineeController,
} from '../controllers/nominees.controller';

// Medical records controllers
import {
  getReportsController,
  createReportController,
  getPrescriptionsController,
  createPrescriptionController,
  updateReportController,
  updatePrescriptionController,
  deleteReportController,
  deletePrescriptionController,
} from '../controllers/medicalRecords.controller';

// Audit logs controllers
import {
  getAuditLogsController,
} from '../controllers/auditLogs.controller';

// Emergency SOS controllers
import {
  activateEmergencySosController,
  updateEmergencySosController,
  getEmergencySosHistoryController,
  getEmergencySosDetailController,
} from '../controllers/emergency.controller';
import {
  createUploadUrlController,
  finalizeUploadController,
  uploadFileDirectController,
} from '../controllers/upload.controller';


// Access Requests controllers
import {
  getPatientAccessRequestsController,
  approveAccessRequestController,
  rejectAccessRequestController,
  updateAccessRequestController,
  revokeAccessRequestController,
} from '../controllers/accessRequests.controller';

// Validators
import {
  healthDataSchema,
  createMedicalRecordSchema,
  createEmergencySosSchema,
  createUploadUrlSchema,
  finalizeUploadSchema,
  createNomineeSchema,
  updateNomineeSchema,
} from '../validators/patient.validators';

export const patientRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// All routes require authentication
patientRouter.use(authenticate);

// ============
// USER ROUTES
// ============

/**
 * @swagger
 * /api/v1/patient/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns current authenticated user profile with patient data and QR code
 *     tags:
 *       - Patient Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
patientRouter.get('/me', getCurrentUserController);
patientRouter.get('/health', getUserHealthController);

// ============
// NOMINEES
// ============

/**
 * @swagger
 * /api/v1/patient/nominees:
 *   get:
 *     summary: Get all nominees
 *     description: Returns all nominees associated with the authenticated patient
 *     tags:
 *       - Nominees
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nominees retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient profile not found
 *   post:
 *     summary: Add a new nominee
 *     description: Create a new nominee linked to the authenticated patient
 *     tags:
 *       - Nominees
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ravi Sharma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ravi@example.com
 *     responses:
 *       201:
 *         description: Nominee created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
patientRouter.get('/nominees', getNomineesController);
patientRouter.post('/nominees', validateBody(createNomineeSchema), createNomineeController);

/**
 * @swagger
 * /api/v1/patient/nominees/{id}:
 *   put:
 *     summary: Update a nominee
 *     description: Update name and/or email of an existing nominee. At least one field must be provided.
 *     tags:
 *       - Nominees
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Nominee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ravi Sharma Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ravi.updated@example.com
 *     responses:
 *       200:
 *         description: Nominee updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — nominee belongs to another patient
 *       404:
 *         description: Nominee not found
 */
patientRouter.put('/nominees/:id', validateBody(updateNomineeSchema), updateNomineeController);

/**
 * @swagger
 * /api/v1/patient/health:
 *   get:
 *     summary: Get comprehensive health data
 *     description: Returns all health metrics including heart rate, blood pressure, blood glucose, temperature, weight, allergies, and chronic conditions
 *     tags:
 *       - Health Records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health data retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new health record
 *     description: Add a new health data entry (heart rate, blood pressure, temperature, etc.)
 *     tags:
 *       - Health Records
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heartRate:
 *                 type: number
 *               bloodPressure:
 *                 type: string
 *               bloodGlucose:
 *                 type: number
 *               temperature:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Health record created successfully
 *       400:
 *         description: Invalid input
 */
patientRouter.post('/health', validateBody(healthDataSchema), createUserHealthRecordController);

// ==================
// ACCESS REQUESTS
// ==================

patientRouter.get('/access-requests', getPatientAccessRequestsController);
patientRouter.post('/access-requests/:id/approve', approveAccessRequestController);
patientRouter.post('/access-requests/:id/reject', rejectAccessRequestController);
patientRouter.post('/access-requests/:id/update', updateAccessRequestController);
patientRouter.post('/access-requests/:id/revoke', revokeAccessRequestController);

// ==================
// MEDICAL RECORDS - REPORTS
// ==================

/**
 * @swagger
 * /api/v1/patient/reports:
 *   get:
 *     summary: Get all medical reports
 *     description: Retrieve all medical reports for the authenticated patient
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportId
 *         schema:
 *           type: string
 *         description: Get specific report details
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new medical report
 *     description: Add a new medical report
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Invalid input
 */
patientRouter.get('/reports', getReportsController);
patientRouter.post('/reports', validateBody(createMedicalRecordSchema), createReportController);

/**
 * @swagger
 * /api/v1/patient/reports/{reportId}:
 *   put:
 *     summary: Update medical report
 *     description: Update an existing medical report
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report updated successfully
 *       404:
 *         description: Report not found
 *   delete:
 *     summary: Delete medical report
 *     description: Remove a medical report
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */
patientRouter.put('/reports/:reportId', updateReportController);
patientRouter.delete('/reports/:reportId', deleteReportController);

// ==================
// MEDICAL RECORDS - PRESCRIPTIONS
// ==================

/**
 * @swagger
 * /api/v1/patient/prescriptions:
 *   get:
 *     summary: Get all prescriptions
 *     description: Retrieve all prescriptions for the authenticated patient
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: prescriptionId
 *         schema:
 *           type: string
 *         description: Get specific prescription details
 *     responses:
 *       200:
 *         description: Prescriptions retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create new prescription
 *     description: Add a new prescription record
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicationName:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Invalid input
 */
patientRouter.get('/prescriptions', getPrescriptionsController);
patientRouter.post('/prescriptions', validateBody(createMedicalRecordSchema), createPrescriptionController);

/**
 * @swagger
 * /api/v1/patient/prescriptions/{prescriptionId}:
 *   put:
 *     summary: Update prescription
 *     description: Update an existing prescription
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prescriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       404:
 *         description: Prescription not found
 *   delete:
 *     summary: Delete prescription
 *     description: Remove a prescription
 *     tags:
 *       - Medical Records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prescriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription deleted successfully
 *       404:
 *         description: Prescription not found
 */
patientRouter.put('/prescriptions/:prescriptionId', updatePrescriptionController);
patientRouter.delete('/prescriptions/:prescriptionId', deletePrescriptionController);

// ==================
// AUDIT LOGS
// ==================

/**
 * @swagger
 * /api/v1/patient/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Retrieve audit logs for all data access to user's medical records
 *     tags:
 *       - Audit & Security
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Get specific audit log entry
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
patientRouter.get('/audit-logs', getAuditLogsController);


// ==================
// EMERGENCY SOS
// ==================

/**
 * @swagger
 * /api/v1/patient/emergency:
 *   post:
 *     summary: Activate emergency SOS
 *     description: Activate emergency SOS - notifies emergency contacts and shares critical health information
 *     tags:
 *       - Emergency
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Emergency SOS activated successfully
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get emergency SOS history
 *     description: Retrieve list of all emergency SOS records
 *     tags:
 *       - Emergency
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SOS history retrieved successfully
 */
patientRouter.post('/emergency', validateBody(createEmergencySosSchema), activateEmergencySosController);
patientRouter.get('/emergency', getEmergencySosHistoryController);

/**
 * @swagger
 * /api/v1/patient/emergency/{sosId}:
 *   get:
 *     summary: Get emergency SOS details
 *     description: Retrieve details of a specific emergency SOS record
 *     tags:
 *       - Emergency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SOS details retrieved successfully
 *       404:
 *         description: SOS record not found
 *   put:
 *     summary: Update emergency SOS
 *     description: Update the status or details of an emergency SOS record
 *     tags:
 *       - Emergency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SOS updated successfully
 *       404:
 *         description: SOS record not found
 */
patientRouter.get('/emergency/:sosId', getEmergencySosDetailController);
patientRouter.put('/emergency/:sosId', updateEmergencySosController);

// ==================
// FILE UPLOADS (SUPABASE)
// ==================

/**
 * @swagger
 * /api/v1/patient/uploads/file:
 *   post:
 *     summary: Upload file directly to Supabase
 *     description: Accepts multipart file upload and returns uploaded public URL.
 *     tags:
 *       - File Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: reports
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: File missing
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Supabase storage not configured
 */
patientRouter.post('/uploads/file', upload.single('file'), uploadFileDirectController);

/**
 * @swagger
 * /api/v1/patient/uploads/sign:
 *   post:
 *     summary: Create signed upload URL
 *     description: Creates a Supabase signed upload URL and storage path for direct file upload.
 *     tags:
 *       - File Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - contentType
 *             properties:
 *               fileName:
 *                 type: string
 *               contentType:
 *                 type: string
 *               folder:
 *                 type: string
 *                 enum: [reports, prescriptions, scans, other]
 *     responses:
 *       201:
 *         description: Signed URL generated successfully
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Supabase storage not configured
 */
patientRouter.post('/uploads/sign', validateBody(createUploadUrlSchema), createUploadUrlController);

/**
 * @swagger
 * /api/v1/patient/uploads/finalize:
 *   post:
 *     summary: Finalize upload and create record
 *     description: Finalizes uploaded file metadata and creates a medical record linked to Supabase file URL.
 *     tags:
 *       - File Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - type
 *               - title
 *             properties:
 *               path:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [prescription, report, scan, vaccination, other]
 *               title:
 *                 type: string
 *               originalContent:
 *                 type: string
 *               documentDate:
 *                 type: string
 *                 format: date
 *               privacy:
 *                 type: string
 *                 enum: [private, shared]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Upload finalized and medical record created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invalid upload path
 *       404:
 *         description: Patient profile not found
 */
patientRouter.post('/uploads/finalize', validateBody(finalizeUploadSchema), finalizeUploadController);

