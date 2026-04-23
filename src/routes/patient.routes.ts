import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';

// Patient controllers
import {
  getCurrentUserController,
  getUserHealthController,
  createUserHealthRecordController,
} from '../controllers/patient.controller';

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

// Access logs controllers
import {
  getAccessLogsController,
  createAccessLogController,
  updateAccessLogController,
} from '../controllers/accessLogs.controller';

// Validators
import {
  healthDataSchema,
  createMedicalRecordSchema,
  createEmergencySosSchema,
} from '../validators/patient.validators';

export const patientRouter = Router();

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
// ACCESS LOGS
// ==================

/**
 * @swagger
 * /api/v1/patient/access-logs:
 *   get:
 *     summary: Get access logs
 *     description: Retrieve all access logs for the patient's data
 *     tags:
 *       - Audit & Security
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Get specific access log record
 *     responses:
 *       200:
 *         description: Access logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create access log
 *     description: Create a new access log record
 *     tags:
 *       - Audit & Security
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Access log created successfully
 */
patientRouter.get('/access-logs', getAccessLogsController);
patientRouter.post('/access-logs', createAccessLogController);

/**
 * @swagger
 * /api/v1/patient/access-logs/{accessLogId}:
 *   put:
 *     summary: Update access log
 *     description: Update an existing access log record
 *     tags:
 *       - Audit & Security
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accessLogId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Access log updated successfully
 *       404:
 *         description: Access log not found
 */
patientRouter.put('/access-logs/:accessLogId', updateAccessLogController);

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

// ============
// USER ROUTES
// ============

/**
 * GET /api/user/me
 * Returns current user profile with patient data and QR code
 */
patientRouter.get('/me', getCurrentUserController);

/**
 * GET /api/user/health
 * Returns comprehensive health data including:
 * - Heart rate, blood pressure, blood glucose, temperature, weight
 * - All allergies with severity levels
 * - Chronic conditions with status
 */
patientRouter.get('/health', getUserHealthController);

/**
 * POST /api/user/health
 * Create a new health record
 */
patientRouter.post('/health', validateBody(healthDataSchema), createUserHealthRecordController);

// ==================
// MEDICAL RECORDS - REPORTS
// ==================

/**
 * GET /api/history/reports
 * Get all reports for the patient
 * 
 * GET /api/history/reports?reportId={id}
 * Get specific report details
 */
patientRouter.get('/reports', getReportsController);

/**
 * POST /api/history/reports
 * Create a new medical report
 */
patientRouter.post('/reports', validateBody(createMedicalRecordSchema), createReportController);

/**
 * PUT /api/history/reports/:reportId
 * Update a specific report
 */
patientRouter.put('/reports/:reportId', updateReportController);

/**
 * DELETE /api/history/reports/:reportId
 * Delete a specific report
 */
patientRouter.delete('/reports/:reportId', deleteReportController);

// ==================
// MEDICAL RECORDS - PRESCRIPTIONS
// ==================

/**
 * GET /api/history/prescriptions
 * Get all prescriptions for the patient
 * 
 * GET /api/history/prescriptions?prescriptionId={id}
 * Get specific prescription details
 */
patientRouter.get('/prescriptions', getPrescriptionsController);

/**
 * POST /api/history/prescriptions
 * Create a new prescription
 */
patientRouter.post('/prescriptions', validateBody(createMedicalRecordSchema), createPrescriptionController);

/**
 * PUT /api/history/prescriptions/:prescriptionId
 * Update a specific prescription
 */
patientRouter.put('/prescriptions/:prescriptionId', updatePrescriptionController);

/**
 * DELETE /api/history/prescriptions/:prescriptionId
 * Delete a specific prescription
 */
patientRouter.delete('/prescriptions/:prescriptionId', deletePrescriptionController);

// ==================
// AUDIT LOGS
// ==================

/**
 * GET /api/audit-logs
 * Get all audit logs for the patient's data access
 * 
 * Query: ?id={auditId} - Get specific audit log entry
 */
patientRouter.get('/audit-logs', getAuditLogsController);

// ==================
// ACCESS LOGS
// ==================

/**
 * GET /api/access-logs
 * Get all access logs for the patient's data
 * 
 * GET /api/access-logs?id={accessLogId}
 * Get specific access log record
 */
patientRouter.get('/access-logs', getAccessLogsController);

/**
 * POST /api/access-logs
 * Create a new access log record
 */
patientRouter.post('/access-logs', createAccessLogController);

/**
 * PUT /api/access-logs/:accessLogId
 * Update a specific access log record
 */
patientRouter.put('/access-logs/:accessLogId', updateAccessLogController);

// ==================
// EMERGENCY SOS
// ==================

/**
 * POST /api/emergency
 * Activate emergency SOS - notifies emergency contacts and shares critical info
 */
patientRouter.post('/emergency', validateBody(createEmergencySosSchema), activateEmergencySosController);

/**
 * GET /api/emergency
 * Get list of all emergency SOS records
 * 
 * GET /api/emergency/:sosId
 * Get specific emergency SOS record details
 */
patientRouter.get('/emergency/:sosId', getEmergencySosDetailController);
patientRouter.get('/emergency', getEmergencySosHistoryController);

/**
 * PUT /api/emergency/:sosId
 * Update emergency SOS status
 */
patientRouter.put('/emergency/:sosId', updateEmergencySosController);
