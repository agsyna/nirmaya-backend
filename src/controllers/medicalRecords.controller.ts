import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import {
  getMedicalRecordsByPatientAndType,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from '../repositories/medicalRecords.repository';
import { getPatientByUserId } from '../repositories/patient.repository';
import { createMedicalRecordSchema, updateMedicalRecordSchema } from '../validators/patient.validators';

/**
 * GET /history/reports
 * GET /history/reports?reportId={id}
 * 
 * Returns list of all reports for the patient, or a specific report if reportId is provided
 */
export const getReportsController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const limit = Math.min(Number(request.query.limit) || 10, 100);
  const offset = Number(request.query.offset) || 0;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  // Check if reportId query parameter is provided
  const reportId = (() => {
    const id = request.query.reportId;
    if (typeof id === 'string') return id;
    if (Array.isArray(id)) return id[0];
    return undefined;
  })() as string | undefined;

  if (reportId) {
    // Fetch specific report
    const report = await getMedicalRecordById(reportId, patient.patientId);

    response.status(200).json({
      status: 'success',
      data: {
        recordId: report.recordId,
        type: report.type,
        title: report.title,
        fileUrl: report.fileUrl,
        originalContent: report.originalContent,
        aiSummary: report.aiSummary,
        aiSummaryGeneratedAt: report.aiSummaryGeneratedAt,
        documentDate: report.documentDate,
        privacy: report.privacy,
        metadata: report.metadata,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
    return;
  }

  // Fetch all reports for the patient
  const reports = await getMedicalRecordsByPatientAndType(patient.patientId, 'report', limit + offset);
  const paginatedReports = reports.slice(offset, offset + limit);

  response.status(200).json({
    status: 'success',
    data: paginatedReports.map((report: any) => ({
      recordId: report.recordId,
      type: report.type,
      title: report.title,
      fileUrl: report.fileUrl,
      documentDate: report.documentDate,
      privacy: report.privacy,
      createdAt: report.createdAt,
    })),
    meta: {
      count: paginatedReports.length,
      total: reports.length,
      limit,
      offset,
      hasMore: offset + paginatedReports.length < reports.length,
    },
  });
});

/**
 * POST /history/reports
 * Create a new medical report
 */
export const createReportController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = createMedicalRecordSchema.parse(request.body);
  const { type: _type, ...rest } = validated;

  const report = await createMedicalRecord({
    patientId: patient.patientId,
    type: 'report',
    ...rest,
    uploadedBy: userId,
    documentDate: validated.documentDate ? new Date(validated.documentDate) : new Date(),
  });

  response.status(201).json({
    status: 'success',
    data: {
      recordId: report.recordId,
      type: report.type,
      title: report.title,
      fileUrl: report.fileUrl,
      privacy: report.privacy,
      createdAt: report.createdAt,
    },
  });
});

/**
 * GET /history/prescriptions
 * GET /history/prescriptions?prescriptionId={id}
 * 
 * Returns list of all prescriptions for the patient, or a specific prescription if prescriptionId is provided
 */
export const getPrescriptionsController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const limit = Math.min(Number(request.query.limit) || 10, 100);
  const offset = Number(request.query.offset) || 0;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  // Check if prescriptionId query parameter is provided
  const prescriptionId = (() => {
    const id = request.query.prescriptionId;
    if (typeof id === 'string') return id;
    if (Array.isArray(id)) return id[0];
    return undefined;
  })() as string | undefined;

  if (prescriptionId) {
    // Fetch specific prescription
    const prescription = await getMedicalRecordById(prescriptionId, patient.patientId);

    response.status(200).json({
      status: 'success',
      data: {
        recordId: prescription.recordId,
        type: prescription.type,
        title: prescription.title,
        fileUrl: prescription.fileUrl,
        originalContent: prescription.originalContent,
        aiSummary: prescription.aiSummary,
        documentDate: prescription.documentDate,
        privacy: prescription.privacy,
        metadata: prescription.metadata,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt,
      },
    });
    return;
  }

  // Fetch all prescriptions for the patient
  const prescriptions = await getMedicalRecordsByPatientAndType(patient.patientId, 'prescription', limit + offset);
  const paginatedPrescriptions = prescriptions.slice(offset, offset + limit);

  response.status(200).json({
    status: 'success',
    data: paginatedPrescriptions.map((prescription: any) => ({
      recordId: prescription.recordId,
      type: prescription.type,
      title: prescription.title,
      fileUrl: prescription.fileUrl,
      documentDate: prescription.documentDate,
      privacy: prescription.privacy,
      createdAt: prescription.createdAt,
    })),
    meta: {
      count: paginatedPrescriptions.length,
      total: prescriptions.length,
      limit,
      offset,
      hasMore: offset + paginatedPrescriptions.length < prescriptions.length,
    },
  });
});

/**
 * POST /history/prescriptions
 * Create a new medical prescription
 */
export const createPrescriptionController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = createMedicalRecordSchema.parse(request.body);
  const { type: _type, ...rest } = validated;

  const prescription = await createMedicalRecord({
    patientId: patient.patientId,
    type: 'prescription',
    ...rest,
    uploadedBy: userId,
    documentDate: validated.documentDate ? new Date(validated.documentDate) : new Date(),
  });

  response.status(201).json({
    status: 'success',
    data: {
      recordId: prescription.recordId,
      type: prescription.type,
      title: prescription.title,
      fileUrl: prescription.fileUrl,
      privacy: prescription.privacy,
      createdAt: prescription.createdAt,
    },
  });
});

/**
 * PUT /history/reports/:reportId
 * Update a specific report
 */
export const updateReportController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const reportId = Array.isArray(request.params.reportId) ? request.params.reportId[0] : request.params.reportId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = updateMedicalRecordSchema.partial().parse(request.body);

  const updatedReport = await updateMedicalRecord(reportId, patient.patientId, validated);

  response.status(200).json({
    status: 'success',
    data: {
      recordId: updatedReport.recordId,
      type: updatedReport.type,
      title: updatedReport.title,
      fileUrl: updatedReport.fileUrl,
      privacy: updatedReport.privacy,
      updatedAt: updatedReport.updatedAt,
    },
  });
});

/**
 * PUT /history/prescriptions/:prescriptionId
 * Update a specific prescription
 */
export const updatePrescriptionController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const prescriptionId = Array.isArray(request.params.prescriptionId) ? request.params.prescriptionId[0] : request.params.prescriptionId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  const validated = updateMedicalRecordSchema.partial().parse(request.body);

  const updatedPrescription = await updateMedicalRecord(prescriptionId, patient.patientId, validated);

  response.status(200).json({
    status: 'success',
    data: {
      recordId: updatedPrescription.recordId,
      type: updatedPrescription.type,
      title: updatedPrescription.title,
      fileUrl: updatedPrescription.fileUrl,
      privacy: updatedPrescription.privacy,
      updatedAt: updatedPrescription.updatedAt,
    },
  });
});

/**
 * DELETE /history/reports/:reportId
 * Delete a specific report
 */
export const deleteReportController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const reportId = Array.isArray(request.params.reportId) ? request.params.reportId[0] : request.params.reportId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  await deleteMedicalRecord(reportId, patient.patientId);

  response.status(200).json({
    status: 'success',
    message: 'Report deleted successfully',
  });
});

/**
 * DELETE /history/prescriptions/:prescriptionId
 * Delete a specific prescription
 */
export const deletePrescriptionController = asyncHandler(async (request: Request, response: Response) => {
  const userId = request.auth?.userId;
  const prescriptionId = Array.isArray(request.params.prescriptionId) ? request.params.prescriptionId[0] : request.params.prescriptionId;

  if (!userId) {
    throw new AppError(401, 'Unauthorized');
  }

  const patient = await getPatientByUserId(userId);

  if (!patient) {
    throw new AppError(404, 'Patient profile not found');
  }

  await deleteMedicalRecord(prescriptionId, patient.patientId);

  response.status(200).json({
    status: 'success',
    message: 'Prescription deleted successfully',
  });
});
