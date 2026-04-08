## Healthcare Backend API Documentation

### Overview
This document outlines all the patient-facing APIs implemented for the healthcare backend application. All endpoints (except `/auth`) require authentication via JWT bearer token.

---

## Authentication

### Base URL
```
/api
```

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

---

## User Endpoints

### 1. Get Current User Profile
**Endpoint:** `GET /user/me`

**Description:** Returns the currently authenticated user's profile along with basic patient information and QR code.

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "phone": "+1234567890",
      "type": "patient"
    },
    "patient": {
      "patientId": "uuid",
      "bloodGroup": "O+",
      "height": "180.00",
      "weight": "75.00",
      "emergencySosEnabled": true
    },
    "qrCode": {
      "code": "https://health-app.com/qr/{patientId}",
      "generatedAt": "2026-04-08T10:00:00Z"
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Patient profile not found

---

### 2. Get Comprehensive Health Data
**Endpoint:** `GET /user/health`

**Description:** Returns comprehensive health information including health metrics, allergies, and chronic conditions.

**Response:**
```json
{
  "status": "success",
  "data": {
    "patient": {
      "patientId": "uuid",
      "bloodGroup": "O+",
      "height": "180.00",
      "weight": "75.00"
    },
    "healthData": [
      {
        "healthDataId": "uuid",
        "heartRate": 72,
        "bloodPressure": "120/80",
        "bloodGlucose": "95.50",
        "temperature": "37.00",
        "weight": "75.00",
        "recordedAt": "2026-04-08T10:00:00Z",
        "notes": "Normal reading"
      }
    ],
    "allergies": [
      {
        "allergyId": "uuid",
        "allergyName": "Peanuts",
        "severity": "severe",
        "description": "Anaphylaxis risk"
      }
    ],
    "chronicConditions": [
      {
        "conditionId": "uuid",
        "conditionName": "Diabetes Type 2",
        "status": "active",
        "diagnosisDate": "2020-05-15",
        "notes": "Controlled with medication"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Patient profile not found

---

### 3. Create Health Record
**Endpoint:** `POST /user/health`

**Description:** Creates a new health data record with measurements.

**Request Body:**
```json
{
  "bloodPressure": "120/80",
  "bloodGlucose": 95.5,
  "heartRate": 72,
  "temperature": 37.0,
  "weight": 75.0,
  "notes": "Morning reading",
  "recordedAt": "2026-04-08T10:00:00Z"
}
```

**All fields are optional.**

**Response:**
```json
{
  "status": "success",
  "data": {
    "healthDataId": "uuid",
    "heartRate": 72,
    "bloodPressure": "120/80",
    "bloodGlucose": "95.50",
    "temperature": "37.00",
    "weight": "75.00",
    "notes": "Morning reading",
    "recordedAt": "2026-04-08T10:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid input
- `401` - Unauthorized
- `404` - Patient profile not found

---

## Medical Records Endpoints

### 4. Get Reports
**Endpoint:** `GET /history/reports`

**Description:** Returns list of all medical reports for the patient.

Returns list of reports with summary information.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "recordId": "uuid",
      "type": "report",
      "title": "Blood Test Report",
      "fileUrl": "https://cdn.example.com/report.pdf",
      "documentDate": "2026-04-01",
      "privacy": "private",
      "createdAt": "2026-04-08T09:00:00Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

### 5. Get Specific Report
**Endpoint:** `GET /history/reports?reportId={reportId}`

**Description:** Returns full details of a specific report.

**Query Parameters:**
- `reportId` (string, required): UUID of the report

**Response:**
```json
{
  "status": "success",
  "data": {
    "recordId": "uuid",
    "type": "report",
    "title": "Blood Test Report",
    "fileUrl": "https://cdn.example.com/report.pdf",
    "originalContent": "Raw OCR text...",
    "aiSummary": "Summary of the report...",
    "aiSummaryGeneratedAt": "2026-04-08T09:30:00Z",
    "documentDate": "2026-04-01",
    "privacy": "private",
    "metadata": { "lab": "Quest Diagnostics" },
    "createdAt": "2026-04-08T09:00:00Z",
    "updatedAt": "2026-04-08T09:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Report not found

---

### 6. Create Report
**Endpoint:** `POST /history/reports`

**Description:** Creates a new medical report.

**Request Body:**
```json
{
  "type": "report",
  "title": "Blood Test Report",
  "fileUrl": "https://cdn.example.com/report.pdf",
  "originalContent": "Raw text from OCR",
  "documentDate": "2026-04-01",
  "privacy": "private",
  "metadata": { "lab": "Quest Diagnostics" }
}
```

**Required:** `type`, `title`, `fileUrl`
**Optional:** `originalContent`, `documentDate`, `privacy` (default: "private"), `metadata`

**Response:**
```json
{
  "status": "success",
  "data": {
    "recordId": "uuid",
    "type": "report",
    "title": "Blood Test Report",
    "fileUrl": "https://cdn.example.com/report.pdf",
    "privacy": "private",
    "createdAt": "2026-04-08T10:15:00Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid input
- `401` - Unauthorized

---

### 7. Update Report
**Endpoint:** `PUT /history/reports/{reportId}`

**Description:** Updates a specific report.

**Path Parameters:**
- `reportId` (string): UUID of the report

**Request Body:** (all optional)
```json
{
  "title": "Updated Title",
  "privacy": "shared",
  "metadata": { "updated": true }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "recordId": "uuid",
    "type": "report",
    "title": "Updated Title",
    "fileUrl": "https://cdn.example.com/report.pdf",
    "privacy": "shared",
    "updatedAt": "2026-04-08T11:00:00Z"
  }
}
```

---

### 8. Delete Report
**Endpoint:** `DELETE /history/reports/{reportId}`

**Description:** Deletes a specific report.

**Response:**
```json
{
  "status": "success",
  "message": "Report deleted successfully"
}
```

---

### 9-13. Prescriptions Endpoints
The prescription endpoints follow the same pattern as reports:
- `GET /history/prescriptions` - List all prescriptions
- `GET /history/prescriptions?prescriptionId={id}` - Get specific prescription
- `POST /history/prescriptions` - Create prescription
- `PUT /history/prescriptions/{prescriptionId}` - Update prescription
- `DELETE /history/prescriptions/{prescriptionId}` - Delete prescription

All endpoints accept and return the same data structure with `type: "prescription"`.

---

## Audit Logs Endpoints

### 14. Get Audit Logs
**Endpoint:** `GET /audit-logs`

**Description:** Returns list of all audit logs tracking data access for the patient's records.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "auditId": "uuid",
      "action": "view",
      "status": "success",
      "timestamp": "2026-04-08T09:00:00Z",
      "accessedByUserId": "uuid",
      "accessedRecordId": "uuid",
      "ipAddress": "192.168.1.1",
      "errorMessage": null,
      "metadata": {}
    }
  ],
  "meta": {
    "count": 5
  }
}
```

---

### 15. Get Specific Audit Log
**Endpoint:** `GET /audit-logs?id={auditId}`

**Description:** Returns details of a specific audit log entry.

**Query Parameters:**
- `id` (string): UUID of the audit log

**Response:** Returns single audit log object (same structure as list)

---

## Access Logs Endpoints

### 16. Get Access Logs
**Endpoint:** `GET /access-logs`

**Description:** Returns list of all access logs for data access tracking.

**Response:** Same format as audit logs with `accessLogId` field

---

### 17. Get Specific Access Log
**Endpoint:** `GET /access-logs?id={accessLogId}`

**Description:** Returns details of a specific access log record.

---

### 18. Create Access Log
**Endpoint:** `POST /access-logs`

**Description:** Creates a new access log record for tracking data access.

**Request Body:**
```json
{
  "shareTokenId": "uuid",
  "action": "view",
  "accessedByUserId": "uuid",
  "accessedRecordId": "uuid",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "status": "success",
  "errorMessage": null,
  "metadata": {}
}
```

**Required:** `shareTokenId`, `action`, `accessedByUserId`
**Optional:** Other fields

---

### 19. Update Access Log
**Endpoint:** `PUT /access-logs/{accessLogId}`

**Description:** Updates a specific access log record.

**Request Body:** (optional)
```json
{
  "status": "failed",
  "errorMessage": "Unauthorized access attempt",
  "metadata": { "alert": true }
}
```

---

## Emergency SOS Endpoints

### 20. Activate Emergency SOS
**Endpoint:** `POST /emergency`

**Description:** Activates emergency SOS, notifying emergency contacts and sharing critical health information.

**Request Body:**
```json
{
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "ambulanceCalled": false,
  "voiceMessageSent": false,
  "contactsNotified": ["uuid1", "uuid2"]
}
```

**All fields optional.**

**Response:**
```json
{
  "status": "success",
  "data": {
    "sosId": "uuid",
    "patientId": "uuid",
    "status": "active",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "ambulanceCalled": false,
    "voiceMessageSent": false,
    "criticalInfoShared": {
      "bloodGroup": "O+",
      "allergies": [
        { "name": "Peanuts", "severity": "severe" }
      ],
      "chronicConditions": [
        { "name": "Diabetes Type 2", "status": "active" }
      ]
    },
    "createdAt": "2026-04-08T12:00:00Z",
    "message": "Emergency SOS activated. Emergency contacts are being notified."
  }
}
```

**Status Codes:**
- `201` - Created
- `401` - Unauthorized
- `403` - Emergency SOS not enabled
- `404` - Patient profile not found

---

### 21. Get Emergency SOS History
**Endpoint:** `GET /emergency`

**Description:** Returns list of all emergency SOS records.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "sosId": "uuid",
      "status": "active",
      "latitude": "40.7128",
      "longitude": "-74.0060",
      "ambulanceCalled": false,
      "ambulanceEta": null,
      "voiceMessageSent": false,
      "createdAt": "2026-04-08T12:00:00Z",
      "resolvedAt": null
    }
  ],
  "meta": {
    "count": 1
  }
}
```

---

### 22. Get Specific Emergency SOS
**Endpoint:** `GET /emergency/{sosId}`

**Description:** Returns full details of a specific emergency SOS record.

**Path Parameters:**
- `sosId` (string): UUID of the SOS record

**Response:**
```json
{
  "status": "success",
  "data": {
    "sosId": "uuid",
    "status": "active",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "ambulanceCalled": false,
    "ambulanceEta": null,
    "contactsNotified": ["uuid1", "uuid2"],
    "voiceMessageSent": false,
    "criticalInfoShared": { /* as above */ },
    "createdAt": "2026-04-08T12:00:00Z",
    "resolvedAt": null
  }
}
```

---

### 23. Update Emergency SOS
**Endpoint:** `PUT /emergency/{sosId}`

**Description:** Updates an emergency SOS record (e.g., mark as resolved, update ambulance ETA).

**Path Parameters:**
- `sosId` (string): UUID of the SOS record

**Request Body:** (optional)
```json
{
  "ambulanceCalled": true,
  "ambulanceEta": 5,
  "voiceMessageSent": true,
  "status": "resolved"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "sosId": "uuid",
    "status": "resolved",
    "ambulanceCalled": true,
    "ambulanceEta": 5,
    "voiceMessageSent": true,
    "resolvedAt": "2026-04-08T12:15:00Z",
    "updatedAt": "2026-04-08T12:15:00Z"
  }
}
```

---

## Data Types & Enums

### Action Types (for audit/access logs)
- `view`
- `download`
- `print`
- `share`

### Status (for logs)
- `success`
- `failed`

### Medical Record Types
- `prescription`
- `report`
- `scan`
- `vaccination`
- `other`

### Privacy Levels
- `private`
- `shared`

### Allergy Severity
- `mild`
- `moderate`
- `severe`

### Chronic Condition Status
- `active`
- `inactive`
- `resolved`

### Emergency SOS Status
- `active`
- `resolved`
- `cancelled`

### Blood Groups
- `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### Gender
- `male`
- `female`
- `other`
- `prefer_not_to_say`

---

## Login Response

When a user logs in, they receive basic user data immediately:

**Endpoint:** `POST /auth/login`

**Response:**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 30,
    "gender": "male",
    "phone": "+1234567890",
    "type": "patient"
  },
  "patient": {
    "patientId": "uuid",
    "bloodGroup": "O+",
    "height": "180.00",
    "weight": "75.00",
    "emergencySosEnabled": true
  },
  "qrCode": {
    "code": "https://health-app.com/qr/{patientId}",
    "generatedAt": "2026-04-08T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

This eliminates the need for an extra API call to fetch user data immediately after login.

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (action not allowed)
- `404` - Not found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal server error

---

## Architecture Notes

- **All endpoints require authentication** except `/auth` routes
- **Query parameters for detail views** use `?id=`, `?reportId=`, `?prescriptionId=` pattern
- **Business logic** is kept in controllers
- **Database access** is handled by repositories
- **Request body validation** uses Zod schemas
- **Responses** follow a consistent JSON structure with `status`, `data`, and optional `meta` fields
