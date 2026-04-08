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
