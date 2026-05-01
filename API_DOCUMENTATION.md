# Nirmaya Backend API Documentation

Base URL: `/api/v1`  
Auth header: `Authorization: Bearer <jwt>`

## Error Format

```json
{
  "message": "Error message",
  "details": {}
}
```

## Public Endpoints

### `GET /health`
- Response `200|503`: `{ status, timestamp, database, environment, uptime }`

### `POST /auth/register/patient`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+911234567890",
  "age": 30,
  "gender": "male",
  "bloodGroup": "O+",
  "allergies": [{ "name": "Peanut", "severity": "severe", "description": "Anaphylaxis" }],
  "chronicConditions": [{ "name": "Diabetes", "diagnosisDate": "2024-01-10", "status": "active", "notes": "Type 2" }],
  "emergencyContacts": [{ "name": "Jane", "phone": "+919999999999", "relationship": "spouse", "priority": 1 }]
}
```
- Response `201`: `{ user, patient, token }`
- Errors: `400`, `409`

### `POST /auth/login`
- Body: `{ "email": "john@example.com", "password": "password123" }`
- Response `200`: `{ user, patient|null, qrCode|null, token }`
- Errors: `401`

### `POST /auth/forgot-password`
- Body: `{ "email": "john@example.com" }`
- Response `200`: `{ "message": "...", "resetToken": "..." }` (token may be omitted by implementation choice)

### `POST /auth/reset-password`
- Body: `{ "token": "reset-token", "password": "newPassword123" }`
- Response `200`: `{ "message": "Password reset successful" }`
- Errors: `400`

### `POST /share/:token/access`
- Optional doctor auth required when token is doctor-restricted.
- Body: none
- Response `200`: `{ status, data, meta }`
- Errors: `401`, `403`

## Admin Endpoints

### `POST /admin/doctors` (admin auth required)
- Body:
```json
{
  "name": "Dr. Smith",
  "email": "dr@example.com",
  "password": "password123",
  "specialization": "cardiology",
  "licenseNumber": "LIC123"
}
```
- Response `201`: `{ user, doctor, token }`
- Errors: `400`, `401`, `403`, `409`

### `GET /admin/patients` (admin auth required)
- Response `200`: `{ status, data: PatientSummary[], meta: { count } }`

### `GET /admin/patients/:patientId` (admin auth required)
- Response `200`: `{ status, data: PatientDetail }`
- Errors: `404`

### `PUT /admin/patients/:patientId` (admin auth required)
- Body (all optional):
```json
{
  "name": "John Doe",
  "phone": "+911234567890",
  "age": 31,
  "gender": "male",
  "bloodGroup": "O+",
  "emergencySosEnabled": true
}
```
- Response `200`: `{ status, message }`
- Errors: `400`, `404`

### `DELETE /admin/patients/:patientId` (admin auth required)
- Response `200`: `{ status, message }`
- Errors: `404`

## Patient Endpoints (patient auth required unless noted)

### Profile & Health
- `GET /patient/me` -> `{ status, data: { user, patient, qrCode } }`
- `GET /patient/health` -> `{ status, data: { patient, healthData[], allergies[], chronicConditions[] } }`
- `POST /patient/health`
  - Body: `{ bloodPressure?, bloodGlucose?, heartRate?, temperature?, weight?, notes?, recordedAt? }`
  - Response `201`: `{ status, data }`

### Reports
- `GET /patient/reports` -> list
- `GET /patient/reports?reportId=<uuid>` -> single
- `POST /patient/reports`
  - Body: `{ type, title, fileUrl, originalContent?, documentDate?, privacy?, metadata? }`
  - Response `201`: created record
- `PUT /patient/reports/:reportId`
  - Body: `{ title?, aiSummary?, privacy?, metadata? }`
- `DELETE /patient/reports/:reportId`

### Prescriptions
- `GET /patient/prescriptions`
- `GET /patient/prescriptions?prescriptionId=<uuid>`
- `POST /patient/prescriptions`
  - Body: `{ type, title, fileUrl, originalContent?, documentDate?, privacy?, metadata? }`
- `PUT /patient/prescriptions/:prescriptionId`
- `DELETE /patient/prescriptions/:prescriptionId`

### Share Tokens
- `POST /patient/share-tokens`
  - Body: `{ doctorId?, scope: ["prescriptions"|"reports"|"health_data"|"vaccinations"], accessLevel?: "public"|"doctor", maxAccesses?, expiresAt? }`
  - Response includes plaintext token only once
- `GET /patient/share-tokens`
- `DELETE /patient/share-tokens/:tokenId`

### Supabase Upload Flow
- `POST /patient/uploads/file` (single-step direct upload)
  - Content-Type: `multipart/form-data`
  - Fields:
    - `file` (required, binary)
    - `folder` (optional: `reports|prescriptions|scans|other`)
  - Response `201`: `{ bucket, path, fileName, mimeType, size, fileUrl }`

- `POST /patient/uploads/sign`
  - Body: `{ fileName, contentType, folder?: "reports"|"prescriptions"|"scans"|"other" }`
  - Response `201`: `{ bucket, path, signedUrl, token }`
- `POST /patient/uploads/finalize`
  - Body: `{ path, type, title, originalContent?, documentDate?, privacy?, metadata? }`
  - Response `201`: created medical record with storage metadata

Flow:
1. Preferred: call `/patient/uploads/file` with multipart file, get `fileUrl` directly.
2. Alternative: use `/patient/uploads/sign` + direct upload + `/patient/uploads/finalize`.

### Audit & Access Logs
- `GET /patient/audit-logs?id?`
- `GET /patient/access-logs?id?`
- `POST /patient/access-logs`
  - Body: `{ shareTokenId, action, accessedByUserId, accessedRecordId?, ipAddress?, userAgent?, status?, errorMessage?, metadata? }`
- `PUT /patient/access-logs/:accessLogId`
  - Body: `{ status?, errorMessage?, metadata? }`

### Emergency
- `POST /patient/emergency`
  - Body: `{ latitude?, longitude?, ambulanceCalled?, voiceMessageSent?, contactsNotified? }`
- `GET /patient/emergency`
- `GET /patient/emergency/:sosId`
- `PUT /patient/emergency/:sosId`
  - Body: `{ ambulanceCalled?, ambulanceEta?, contactsNotified?, voiceMessageSent?, status? }`

## Enums

- `gender`: `male | female | other | prefer_not_to_say`
- `bloodGroup`: `A+ | A- | B+ | B- | AB+ | AB- | O+ | O-`
- `allergySeverity`: `mild | moderate | severe`
- `chronicConditionStatus`: `active | inactive | resolved`
- `medicalRecordType`: `prescription | report | scan | vaccination | other`
- `privacy`: `private | shared`
- `shareTokenAccessLevel`: `public | doctor`
- `auditAction`: `view | download | print | share`
- `auditStatus`: `success | failed`
- `emergencyStatus`: `active | resolved | cancelled`
