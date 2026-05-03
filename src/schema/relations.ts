import { relations } from 'drizzle-orm';
import { users } from './users';
import { admins } from './admins';
import { doctors } from './doctors';
import { patients } from './patients';
import { allergies } from './allergies';
import { chronicConditions } from './chronicConditions';
import { healthData } from './healthData';
import { vaccinations } from './vaccinations';
import { medicalRecords } from './medicalRecords';
import { reminders } from './reminders';
import { shareTokens } from './shareTokens';
import { auditLogs } from './auditLogs';
import { emergencyContacts } from './emergencyContacts';
import { emergencySos } from './emergencySos';
import { accessRequests } from './accessRequests';

export const usersRelations = relations(users, ({ one, many }) => ({
  admin: one(admins, { fields: [users.userId], references: [admins.userId] }),
  doctor: one(doctors, { fields: [users.userId], references: [doctors.userId] }),
  patient: one(patients, { fields: [users.userId], references: [patients.userId] }),
  auditLogs: many(auditLogs),
  uploadedMedicalRecords: many(medicalRecords),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, { fields: [admins.userId], references: [users.userId] }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.userId] }),
  accessRequests: many(accessRequests),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.userId] }),
  allergies: many(allergies),
  chronicConditions: many(chronicConditions),
  healthData: many(healthData),
  vaccinations: many(vaccinations),
  medicalRecords: many(medicalRecords),
  reminders: many(reminders),
  shareTokens: many(shareTokens),
  auditLogs: many(auditLogs),
  emergencyContacts: many(emergencyContacts),
  emergencySos: many(emergencySos),
  accessRequests: many(accessRequests),
}));

export const allergiesRelations = relations(allergies, ({ one }) => ({
  patient: one(patients, { fields: [allergies.patientId], references: [patients.patientId] }),
}));

export const chronicConditionsRelations = relations(chronicConditions, ({ one }) => ({
  patient: one(patients, { fields: [chronicConditions.patientId], references: [patients.patientId] }),
}));

export const healthDataRelations = relations(healthData, ({ one }) => ({
  patient: one(patients, { fields: [healthData.patientId], references: [patients.patientId] }),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one }) => ({
  patient: one(patients, { fields: [vaccinations.patientId], references: [patients.patientId] }),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one, many }) => ({
  patient: one(patients, { fields: [medicalRecords.patientId], references: [patients.patientId] }),
  uploadedByUser: one(users, { fields: [medicalRecords.uploadedBy], references: [users.userId] }),
  auditLogs: many(auditLogs),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  patient: one(patients, { fields: [reminders.patientId], references: [patients.patientId] }),
}));

export const shareTokensRelations = relations(shareTokens, ({ one, many }) => ({
  patient: one(patients, { fields: [shareTokens.patientId], references: [patients.patientId] }),
  doctor: one(users, { fields: [shareTokens.doctorId], references: [users.userId] }),
  revokedByUser: one(users, { fields: [shareTokens.revokedBy], references: [users.userId] }),
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  shareToken: one(shareTokens, { fields: [auditLogs.shareTokenId], references: [shareTokens.tokenId] }),
  patient: one(patients, { fields: [auditLogs.patientId], references: [patients.patientId] }),
  accessedByUser: one(users, { fields: [auditLogs.accessedByUserId], references: [users.userId] }),
  accessedRecord: one(medicalRecords, {
    fields: [auditLogs.accessedRecordId],
    references: [medicalRecords.recordId],
  }),
}));

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
  patient: one(patients, { fields: [emergencyContacts.patientId], references: [patients.patientId] }),
}));

export const emergencySosRelations = relations(emergencySos, ({ one }) => ({
  patient: one(patients, { fields: [emergencySos.patientId], references: [patients.patientId] }),
}));

export const accessRequestsRelations = relations(accessRequests, ({ one }) => ({
  patient: one(patients, { fields: [accessRequests.patientId], references: [patients.patientId] }),
  doctor: one(doctors, { fields: [accessRequests.doctorId], references: [doctors.doctorId] }),
  shareToken: one(shareTokens, { fields: [accessRequests.shareTokenId], references: [shareTokens.tokenId] }),
}));
