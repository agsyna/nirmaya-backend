# Nirmaya Medical Records API - Complete Documentation

## Base Configuration

- **Base URL**: `/api/v1`
- **API Version**: 1.0.0
- **Authentication**: JWT Bearer Token
- **Response Format**: JSON
- **Default Timezone**: UTC

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": { /* response data */ },
  "meta": { /* optional metadata like pagination */ }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message",
  "details": { /* optional validation details */ }
}
```

### Standard HTTP Status Codes
- `200` - OK (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection issues)

---

## Authentication

### JWT Token
- **Header**: `Authorization: Bearer <token>`
- **Token Expiration**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Token Type**: HS256 signed JWT

### User Roles
1. **patient** - Registered patient users
2. **doctor** - Medical professionals (admin-registered)
3. **admin** - System administrators (seeded in database)

### Access Control Matrix

| Endpoint | Public | Patient | Doctor | Admin |
|----------|--------|---------|--------|-------|
| POST /auth/register/patient | ✅ | ❌ | ❌ | ❌ |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/forgot-password | ✅ | ✅ | ✅ | ✅ |
| POST /auth/reset-password | ✅ | ✅ | ✅ | ✅ |
| GET /patient/me | ❌ | ✅ | ❌ | ❌ |
| GET /patient/health | ❌ | ✅ | ❌ | ❌ |
| POST /patient/health | ❌ | ✅ | ❌ | ❌ |
| GET /patient/reports | ❌ | ✅ | ❌ | ❌ |
| POST /patient/reports | ❌ | ✅ | ❌ | ❌ |
| PUT /patient/reports/{id} | ❌ | ✅ | ❌ | ❌ |
| DELETE /patient/reports/{id} | ❌ | ✅ | ❌ | ❌ |
| GET /patient/prescriptions | ❌ | ✅ | ❌ | ❌ |
| POST /patient/prescriptions | ❌ | ✅ | ❌ | ❌ |
| PUT /patient/prescriptions/{id} | ❌ | ✅ | ❌ | ❌ |
| DELETE /patient/prescriptions/{id} | ❌ | ✅ | ❌ | ❌ |
| GET /patient/audit-logs | ❌ | ✅ | ❌ | ❌ |
| GET /patient/emergency | ❌ | ✅ | ❌ | ❌ |
| POST /patient/emergency | ❌ | ✅ | ❌ | ❌ |
| PUT /patient/emergency/{id} | ❌ | ✅ | ❌ | ❌ |
| POST /patient/upload-url | ❌ | ✅ | ❌ | ❌ |
| POST /patient/finalize-upload | ❌ | ✅ | ❌ | ❌ |
| POST /patient/share-tokens | ❌ | ✅ | ❌ | ❌ |
| GET /patient/share-tokens | ❌ | ✅ | ❌ | ❌ |
| DELETE /patient/share-tokens/{id} | ❌ | ✅ | ❌ | ❌ |
| POST /share/{token}/access | ✅* | ✅ | ❌ | ❌ |
| POST /admin/doctors | ❌ | ❌ | ❌ | ✅ |
| GET /admin/patients | ❌ | ❌ | ❌ | ✅ |
| GET /admin/patients/{id} | ❌ | ❌ | ❌ | ✅ |
| PUT /admin/patients/{id} | ❌ | ❌ | ❌ | ✅ |
| DELETE /admin/patients/{id} | ❌ | ❌ | ❌ | ✅ |
| GET /health | ✅ | ✅ | ✅ | ✅ |

*Only if token is public or user email is in allowed list

---

## Pagination

List endpoints support pagination with query parameters:

### Query Parameters
- `limit` - Number of items per page (default: 10, max: 100)
- `offset` - Number of items to skip (default: 0)

### Pagination Response Meta
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "count": 10,
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Example
```
GET /api/v1/admin/patients?limit=20&offset=0
```

---

## Public Endpoints

### GET /health
System health check endpoint with database and service status.

**Authentication**: Not required

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-01T10:30:00Z",
    "uptime": 3600,
    "database": {
      "status": "connected",
      "latency": 45,
      "pool": {
        "active": 1,
        "idle": 2,
        "waiting": 0
      }
    },
    "supabase": {
      "status": "connected",
      "latency": 120,
      "bucket": "medical-records"
    },
    "version": "1.0.0"
  }
}
```

**Error Responses**:
- `503 Service Unavailable` - Database not connected or Supabase unreachable

---

## Authentication Endpoints

### POST /auth/register/patient
Register a new patient account.

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+911234567890",
  "age": 30,
  "gender": "male",
  "bloodGroup": "O+",
  "height": 180,
  "weight": 75,
  "allergies": [
    {
      "name": "Peanut",
      "severity": "severe",
      "description": "Anaphylaxis risk"
    }
  ],
  "chronicConditions": [
    {
      "name": "Diabetes Type 2",
      "diagnosisDate": "2020-01-15",
      "status": "active",
      "notes": "Well managed"
    }
  ],
  "emergencyContacts": [
    {
      "name": "Jane Doe",
      "phone": "+919999999999",
      "relationship": "spouse",
      "priority": 1
    }
  ]
}
```

**Field Validation**:
- `name` - Required, string, min 1 char
- `email` - Required, valid email format
- `password` - Required, min 8 characters
- `phone` - Optional, max 20 chars
- `age` - Optional, positive integer
- `gender` - Optional, enum: male, female, other, prefer_not_to_say
- `bloodGroup` - Optional, enum: A+, A-, B+, B-, AB+, AB-, O+, O-
- `height` - Optional, positive number (in cm)
- `weight` - Optional, positive number (in kg)
- `allergies[].name` - Required if provided, string
- `allergies[].severity` - Required if provided, enum: mild, moderate, severe
- `allergies[].description` - Optional, string
- `chronicConditions[].name` - Required if provided, string
- `chronicConditions[].diagnosisDate` - Optional, ISO date (YYYY-MM-DD)
- `chronicConditions[].status` - Optional, enum: active, inactive, resolved
- `chronicConditions[].notes` - Optional, string
- `emergencyContacts[].name` - Required if provided, string
- `emergencyContacts[].phone` - Required if provided, string, max 20 chars
- `emergencyContacts[].relationship` - Optional, enum: spouse, parent, sibling, child, relative, friend, caregiver, other
- `emergencyContacts[].priority` - Optional, integer 1-10

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+911234567890",
      "age": 30,
      "gender": "male",
      "type": "patient",
      "createdAt": "2026-05-01T10:30:00Z"
    },
    "patient": {
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "bloodGroup": "O+",
      "height": 180,
      "weight": 75,
      "emergencySosEnabled": false,
      "createdAt": "2026-05-01T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `400 Bad Request` - Validation failed
- `409 Conflict` - Email already registered

---

### POST /auth/login
Authenticate user and receive JWT token.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Field Validation**:
- `email` - Required, valid email format
- `password` - Required, min 8 characters

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "type": "patient",
      "createdAt": "2026-05-01T10:30:00Z"
    },
    "patient": {
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "bloodGroup": "O+",
      "height": 180,
      "weight": 75,
      "emergencySosEnabled": false
    },
    "qrCode": {
      "code": "https://health-app.com/qr/550e8400-e29b-41d4-a716-446655440001",
      "generatedAt": "2026-05-01T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid email or password

---

### POST /auth/forgot-password
Request password reset token.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Password reset token sent to your email",
    "resetToken": "token_only_in_development_for_testing"
  }
}
```

**Note**: In production, reset token is sent via email. In development, it's returned in response for testing.

---

### POST /auth/reset-password
Reset password with valid reset token.

**Authentication**: Not required

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Field Validation**:
- `token` - Required, string, min 10 chars
- `password` - Required, min 8 characters

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Password reset successful"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid or expired token

---

## Patient Endpoints

### GET /patient/me
Get current authenticated patient's profile.

**Authentication**: Required (patient only)

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+911234567890",
      "age": 30,
      "gender": "male",
      "type": "patient"
    },
    "patient": {
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "bloodGroup": "O+",
      "height": 180,
      "weight": 75,
      "emergencySosEnabled": true
    },
    "qrCode": {
      "code": "https://health-app.com/qr/550e8400-e29b-41d4-a716-446655440001",
      "generatedAt": "2026-05-01T10:30:00Z"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Patient profile not found

---

### GET /patient/health
Get comprehensive patient health data.

**Authentication**: Required (patient only)

**Query Parameters**:
- `limit` - Optional, default 10
- `offset` - Optional, default 0

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "patient": {
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "bloodGroup": "O+",
      "height": 180,
      "weight": 75
    },
    "healthData": [
      {
        "healthDataId": "550e8400-e29b-41d4-a716-446655440002",
        "heartRate": 72,
        "bloodPressure": "120/80",
        "bloodGlucose": 95,
        "temperature": 37.2,
        "weight": 75,
        "recordedAt": "2026-05-01T10:00:00Z",
        "notes": "Morning measurement"
      }
    ],
    "allergies": [
      {
        "allergyId": "550e8400-e29b-41d4-a716-446655440003",
        "allergyName": "Peanut",
        "severity": "severe",
        "description": "Anaphylaxis risk"
      }
    ],
    "chronicConditions": [
      {
        "conditionId": "550e8400-e29b-41d4-a716-446655440004",
        "conditionName": "Diabetes Type 2",
        "status": "active",
        "diagnosisDate": "2020-01-15",
        "notes": "Well managed"
      }
    ]
  },
  "meta": {
    "count": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### POST /patient/health
Create a new health data record.

**Authentication**: Required (patient only)

**Request Body**:
```json
{
  "heartRate": 72,
  "bloodPressure": "120/80",
  "bloodGlucose": 95,
  "temperature": 37.2,
  "weight": 75,
  "notes": "Morning measurement",
  "recordedAt": "2026-05-01T10:00:00Z"
}
```

**Field Validation**:
- `bloodPressure` - Optional, format: "sys/dia" (e.g., "120/80")
- `bloodGlucose` - Optional, positive number
- `heartRate` - Optional, positive integer
- `temperature` - Optional, positive number
- `weight` - Optional, positive number
- `notes` - Optional, max 500 chars
- `recordedAt` - Optional, ISO datetime

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "healthDataId": "550e8400-e29b-41d4-a716-446655440002",
    "heartRate": 72,
    "bloodPressure": "120/80",
    "bloodGlucose": 95,
    "temperature": 37.2,
    "weight": 75,
    "notes": "Morning measurement",
    "recordedAt": "2026-05-01T10:00:00Z"
  }
}
```

---

### GET /patient/reports
Get all medical reports or specific report.

**Authentication**: Required (patient only)

**Query Parameters**:
- `reportId` - Optional, returns specific report
- `limit` - Optional, default 10 (for list view)
- `offset` - Optional, default 0 (for list view)

**Response**: `200 OK` (List)
```json
{
  "status": "success",
  "data": [
    {
      "recordId": "550e8400-e29b-41d4-a716-446655440005",
      "type": "report",
      "title": "Chest X-Ray",
      "fileUrl": "https://storage.supabase.com/...",
      "documentDate": "2026-04-30",
      "privacy": "private",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Response**: `200 OK` (Detail)
```json
{
  "status": "success",
  "data": {
    "recordId": "550e8400-e29b-41d4-a716-446655440005",
    "type": "report",
    "title": "Chest X-Ray",
    "fileUrl": "https://storage.supabase.com/...",
    "originalContent": "Report content from OCR/text extraction",
    "aiSummary": "Normal chest X-ray findings",
    "aiSummaryGeneratedAt": "2026-05-01T10:05:00Z",
    "documentDate": "2026-04-30",
    "privacy": "private",
    "metadata": { "radiologist": "Dr. Smith" },
    "createdAt": "2026-05-01T10:00:00Z",
    "updatedAt": "2026-05-01T10:05:00Z"
  }
}
```

---

### POST /patient/reports
Create a new medical report.

**Authentication**: Required (patient only)

**Request Body**:
```json
{
  "type": "report",
  "title": "Chest X-Ray",
  "fileUrl": "https://storage.supabase.com/...",
  "originalContent": "Extracted report text",
  "documentDate": "2026-04-30",
  "privacy": "private",
  "metadata": {
    "radiologist": "Dr. Smith",
    "hospital": "City Hospital"
  }
}
```

**Field Validation**:
- `type` - Required, enum: prescription, report, scan, vaccination, other
- `title` - Required, string, 1-255 chars
- `fileUrl` - Required, valid URL
- `originalContent` - Optional, string
- `documentDate` - Optional, ISO date (YYYY-MM-DD)
- `privacy` - Optional, enum: private, shared (default: private)
- `metadata` - Optional, object

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "recordId": "550e8400-e29b-41d4-a716-446655440005",
    "type": "report",
    "title": "Chest X-Ray",
    "fileUrl": "https://storage.supabase.com/...",
    "privacy": "private",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

---

### PUT /patient/reports/{reportId}
Update an existing medical report.

**Authentication**: Required (patient only)

**Path Parameters**:
- `reportId` - Required, UUID of the report

**Request Body** (all optional):
```json
{
  "title": "Updated Title",
  "aiSummary": "Updated AI summary",
  "privacy": "shared",
  "metadata": {
    "radiologist": "Dr. Jones"
  }
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Report updated successfully"
  }
}
```

---

### DELETE /patient/reports/{reportId}
Delete a medical report.

**Authentication**: Required (patient only)

**Path Parameters**:
- `reportId` - Required, UUID of the report

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Report deleted successfully"
  }
}
```

---

### GET /patient/prescriptions
Get all prescriptions or specific prescription.

**Authentication**: Required (patient only)

**Query Parameters**:
- `prescriptionId` - Optional, returns specific prescription
- `limit` - Optional, default 10 (for list view)
- `offset` - Optional, default 0 (for list view)

**Response**: Similar to /patient/reports

---

### POST /patient/prescriptions
Create a new medical prescription.

**Authentication**: Required (patient only)

**Request Body**: Same as POST /patient/reports

---

### PUT /patient/prescriptions/{prescriptionId}
Update an existing prescription.

**Authentication**: Required (patient only)

**Response**: Same as PUT /patient/reports

---

### DELETE /patient/prescriptions/{prescriptionId}
Delete a prescription.

**Authentication**: Required (patient only)

**Response**: Same as DELETE /patient/reports

---

### GET /patient/audit-logs
Get audit logs of data access.

**Authentication**: Required (patient only)

**Query Parameters**:
- `id` - Optional, returns specific audit log entry
- `limit` - Optional, default 10 (for list view)
- `offset` - Optional, default 0 (for list view)

**Response**: `200 OK` (List)
```json
{
  "status": "success",
  "data": [
    {
      "auditId": "550e8400-e29b-41d4-a716-446655440010",
      "action": "view",
      "status": "success",
      "timestamp": "2026-05-01T10:00:00Z",
      "accessedByUserId": "550e8400-e29b-41d4-a716-446655440020",
      "accessedRecordId": "550e8400-e29b-41d4-a716-446655440005",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "errorMessage": null,
      "metadata": {}
    }
  ],
  "meta": {
    "count": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### GET /patient/emergency
Get emergency SOS records.

**Authentication**: Required (patient only)

**Query Parameters**:
- `sosId` - Optional, returns specific SOS record
- `limit` - Optional, default 10 (for list view)
- `offset` - Optional, default 0 (for list view)

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "sosId": "550e8400-e29b-41d4-a716-446655440030",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "status": "active",
      "latitude": "28.6139",
      "longitude": "77.2090",
      "ambulanceCalled": true,
      "ambulanceEta": 15,
      "voiceMessageSent": true,
      "contactsNotified": ["550e8400-e29b-41d4-a716-446655440040"],
      "criticalInfoShared": {
        "bloodGroup": "O+",
        "allergies": [
          { "name": "Peanut", "severity": "severe" }
        ],
        "chronicConditions": [
          { "name": "Diabetes Type 2", "status": "active" }
        ]
      },
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### POST /patient/emergency
Activate emergency SOS.

**Authentication**: Required (patient only)

**Request Body**:
```json
{
  "latitude": "28.6139",
  "longitude": "77.2090",
  "ambulanceCalled": true,
  "contactsNotified": ["550e8400-e29b-41d4-a716-446655440040"],
  "voiceMessageSent": true
}
```

**Field Validation**:
- `latitude` - Optional, string
- `longitude` - Optional, string
- `ambulanceCalled` - Optional, boolean (default: false)
- `voiceMessageSent` - Optional, boolean (default: false)
- `contactsNotified` - Optional, array of contact UUIDs

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "sosId": "550e8400-e29b-41d4-a716-446655440030",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "active",
    "latitude": "28.6139",
    "longitude": "77.2090",
    "ambulanceCalled": true,
    "voiceMessageSent": true,
    "criticalInfoShared": {
      "bloodGroup": "O+",
      "allergies": [
        { "name": "Peanut", "severity": "severe" }
      ],
      "chronicConditions": [
        { "name": "Diabetes Type 2", "status": "active" }
      ]
    },
    "createdAt": "2026-05-01T10:00:00Z",
    "message": "Emergency SOS activated. Emergency contacts are being notified."
  }
}
```

---

### PUT /patient/emergency/{sosId}
Update emergency SOS status.

**Authentication**: Required (patient only)

**Path Parameters**:
- `sosId` - Required, UUID of the SOS record

**Request Body** (all optional):
```json
{
  "status": "resolved",
  "ambulanceEta": 15,
  "voiceMessageSent": true,
  "contactsNotified": []
}
```

**Field Validation**:
- `status` - Optional, enum: active, resolved, cancelled
- `ambulanceEta` - Optional, positive integer (ETA in minutes)
- `voiceMessageSent` - Optional, boolean
- `contactsNotified` - Optional, array of UUIDs

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Emergency SOS updated successfully"
  }
}
```

---

### POST /patient/upload-url
Get signed upload URL for direct Supabase upload.

**Authentication**: Required (patient only)

**Request Body**:
```json
{
  "fileName": "chest_xray.pdf",
  "contentType": "application/pdf",
  "folder": "reports"
}
```

**Field Validation**:
- `fileName` - Required, string, min 1 char
- `contentType` - Required, string (e.g., "application/pdf", "image/jpeg")
- `folder` - Optional, enum: reports, prescriptions, scans, other (default: other)

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "bucket": "medical-records",
    "path": "550e8400-e29b-41d4-a716-446655440000/reports/1704110400000-a1b2c3d4e5f6g7h8-chest_xray.pdf",
    "signedUrl": "https://supabase.com/storage/v1/object/upload/sign/...",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "contentType": "application/pdf"
  },
  "meta": {
    "expiresIn": 3600,
    "instructions": "POST the file to signedUrl using multipart/form-data with key 'file'"
  }
}
```

**Upload Instructions**:
1. Receive `signedUrl` from this endpoint
2. Use the URL to upload file directly to Supabase:
   ```
   POST /path/to/signedUrl
   Content-Type: multipart/form-data
   
   file: <binary file data>
   ```
3. After successful upload, call POST /patient/finalize-upload with the path

---

### POST /patient/finalize-upload
Finalize uploaded file and create medical record.

**Authentication**: Required (patient only)

**Request Body**:
```json
{
  "path": "550e8400-e29b-41d4-a716-446655440000/reports/1704110400000-a1b2c3d4e5f6g7h8-chest_xray.pdf",
  "type": "report",
  "title": "Chest X-Ray Report",
  "originalContent": "Extracted text from PDF",
  "documentDate": "2026-04-30",
  "privacy": "private",
  "metadata": {
    "hospital": "City Hospital",
    "radiologist": "Dr. Smith"
  }
}
```

**Field Validation**:
- `path` - Required, must start with user ID
- `type` - Required, enum: prescription, report, scan, vaccination, other
- `title` - Required, 1-255 chars
- `originalContent` - Optional
- `documentDate` - Optional, ISO date
- `privacy` - Optional, enum: private, shared (default: private)
- `metadata` - Optional, object

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "recordId": "550e8400-e29b-41d4-a716-446655440005",
    "type": "report",
    "title": "Chest X-Ray Report",
    "fileUrl": "https://storage.supabase.com/...",
    "privacy": "private",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

---

### POST /patient/share-tokens
Create a share token for data access.

**Authentication**: Required (patient only)

**Request Body**:
```json
{
  "scope": ["reports", "health_data"],
  "accessLevel": "doctor",
  "doctorId": "550e8400-e29b-41d4-a716-446655440020",
  "maxAccesses": 10,
  "expiresAt": "2026-05-08T10:00:00Z"
}
```

**Field Validation**:
- `scope` - Required, array of enums: prescriptions, reports, health_data, vaccinations (min 1)
- `accessLevel` - Optional, enum: public, doctor (default: doctor)
- `doctorId` - Optional, UUID (required if accessLevel is doctor)
- `maxAccesses` - Optional, positive integer (limits number of times token can be used)
- `expiresAt` - Optional, ISO datetime

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "tokenId": "550e8400-e29b-41d4-a716-446655440050",
    "token": "qwejef123xyz_shareable_token",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "scope": ["reports", "health_data"],
    "accessLevel": "doctor",
    "maxAccesses": 10,
    "expiresAt": "2026-05-08T10:00:00Z",
    "createdAt": "2026-05-01T10:00:00Z"
  },
  "message": "Share token created. Save this token securely - you will not see it again!"
}
```

---

### GET /patient/share-tokens
List all active share tokens.

**Authentication**: Required (patient only)

**Query Parameters**:
- `limit` - Optional, default 10
- `offset` - Optional, default 0

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "tokenId": "550e8400-e29b-41d4-a716-446655440050",
      "scope": ["reports", "health_data"],
      "accessLevel": "doctor",
      "maxAccesses": 10,
      "accessCount": 3,
      "expiresAt": "2026-05-08T10:00:00Z",
      "createdAt": "2026-05-01T10:00:00Z",
      "status": "active"
    }
  ],
  "meta": {
    "count": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### DELETE /patient/share-tokens/{tokenId}
Revoke a share token.

**Authentication**: Required (patient only)

**Path Parameters**:
- `tokenId` - Required, UUID of the share token

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Share token revoked successfully"
  }
}
```

---

## Data Sharing - Share Token Flow

### Share Token Access Mechanism

The Nirmaya system uses a share token (reference ID) mechanism to securely grant temporary access to patient medical records.

#### 1. Token Generation (Patient Side)

Patient selects:
- Documents to share (specific scope: reports, prescriptions, health_data, vaccinations)
- Access type (public or restricted to specific doctor)
- Expiry duration
- Max number of accesses

System generates unique reference ID (token): `qwejef123xyz`
Shareable link created: `https://nirmaya.com/view/qwejef123xyz`

Token stored with:
- Patient ID
- Scope (what data can be accessed)
- Access type and restrictions
- Expiry timestamp
- Max access count
- Status (active/revoked)

#### 2. Token Usage (Doctor Side)

Doctor:
1. Scans QR code or opens shareable link
2. Browser redirects to `/view/:token`
3. Frontend extracts token and sends: `POST /api/v1/share/:token/access`

#### 3. Backend Validation Flow

**Step 1: Token Lookup**
- Search database for given token
- If not found → return 401 Unauthorized

**Step 2: Check Status**
- If revoked → deny access (return 401)

**Step 3: Check Expiry**
- Compare current time with expiry timestamp
- If expired → deny access (return 401)

**Step 4: Check Max Accesses**
- Compare access count with max allowed
- If limit exceeded → deny access (return 403)

**Step 5: Check Access Type**
- **Public**: Allow access directly
- **Doctor-restricted**: 
  - Validate logged-in doctor ID matches or
  - Email in allowed list
  - If not authorized → deny (return 403)

#### 4. Data Fetching

If all validations pass:
1. Fetch only data within specified scope
2. Retrieve patient summary (public fields only)
3. Increment access counter
4. Log access attempt for audit

#### 5. Response to Doctor

Doctor receives only:
- Specified scope items (reports, health_data, etc.)
- Patient summary (name, age, blood group, allergies, conditions)
- NOT: personal contact info, emergency contacts

---

### POST /share/{token}/access
Access shared patient data using share token.

**Authentication**: Optional (if token is doctor-restricted, doctor auth may be required)

**Path Parameters**:
- `token` - Required, share token (e.g., qwejef123xyz)

**Request Body** (optional):
```json
{
  "accessorEmail": "doctor@hospital.com"
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "patient": {
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "age": 30,
      "gender": "male",
      "bloodGroup": "O+"
    },
    "scope": ["reports", "health_data"],
    "sharedData": {
      "reports": [
        {
          "recordId": "550e8400-e29b-41d4-a716-446655440005",
          "type": "report",
          "title": "Chest X-Ray",
          "fileUrl": "https://storage.supabase.com/...",
          "documentDate": "2026-04-30",
          "createdAt": "2026-05-01T10:00:00Z"
        }
      ],
      "healthData": [
        {
          "healthDataId": "550e8400-e29b-41d4-a716-446655440002",
          "heartRate": 72,
          "bloodPressure": "120/80",
          "recordedAt": "2026-05-01T10:00:00Z"
        }
      ]
    },
    "expiresIn": 3600,
    "accessCountRemaining": 9
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid, expired, or revoked token
- `403 Forbidden` - Access denied (max accesses exceeded or not authorized doctor)

---

## Admin Endpoints

### POST /admin/doctors
Register a new doctor (admin only).

**Authentication**: Required (admin only)

**Request Body**:
```json
{
  "name": "Dr. Sarah Smith",
  "email": "dr.smith@hospital.com",
  "password": "SecurePass123!",
  "phone": "+911234567890",
  "specialization": "cardiology",
  "licenseNumber": "LIC123456",
  "bio": "Experienced cardiologist with 10 years of practice",
  "verified": true
}
```

**Field Validation**:
- `name` - Required, string, min 1 char
- `email` - Required, valid email format
- `password` - Required, min 8 characters
- `phone` - Optional, max 20 chars
- `specialization` - Required, enum: cardiology, dermatology, endocrinology, ent, family_medicine, gastroenterology, general_medicine, gynecology, neurology, oncology, ophthalmology, orthopedics, pediatrics, psychiatry, radiology, urology, other
- `licenseNumber` - Required, string, min 1 char
- `bio` - Optional, string
- `verified` - Optional, boolean (default: false)

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440020",
      "email": "dr.smith@hospital.com",
      "name": "Dr. Sarah Smith",
      "type": "doctor",
      "createdAt": "2026-05-01T10:00:00Z"
    },
    "doctor": {
      "doctorId": "550e8400-e29b-41d4-a716-446655440021",
      "userId": "550e8400-e29b-41d4-a716-446655440020",
      "specialization": "cardiology",
      "licenseNumber": "LIC123456",
      "verified": true,
      "createdAt": "2026-05-01T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Missing token
- `403 Forbidden` - Not an admin
- `409 Conflict` - Email already exists

---

### GET /admin/patients
List all patients (admin only).

**Authentication**: Required (admin only)

**Query Parameters**:
- `limit` - Optional, default 10, max 100
- `offset` - Optional, default 0

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "patientId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+911234567890",
      "age": 30,
      "gender": "male",
      "bloodGroup": "O+",
      "emergencySosEnabled": true,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### GET /admin/patients/{patientId}
Get patient details (admin only).

**Authentication**: Required (admin only)

**Path Parameters**:
- `patientId` - Required, UUID

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+911234567890",
    "age": 30,
    "gender": "male",
    "bloodGroup": "O+",
    "height": 180,
    "weight": 75,
    "emergencySosEnabled": true,
    "createdAt": "2026-05-01T10:00:00Z",
    "updatedAt": "2026-05-01T10:00:00Z"
  }
}
```

---

### PUT /admin/patients/{patientId}
Update patient details (admin only).

**Authentication**: Required (admin only)

**Path Parameters**:
- `patientId` - Required, UUID

**Request Body** (all optional):
```json
{
  "name": "John Smith",
  "phone": "+919999999999",
  "age": 31,
  "gender": "male",
  "bloodGroup": "B+",
  "emergencySosEnabled": false
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Patient updated successfully"
  }
}
```

---

### DELETE /admin/patients/{patientId}
Delete patient account (admin only).

**Authentication**: Required (admin only)

**Path Parameters**:
- `patientId` - Required, UUID

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Patient deleted successfully"
  }
}
```

---

## Error Codes & Messages

### Common Error Responses

#### 400 Bad Request - Validation Failed
```json
{
  "status": "error",
  "message": "Validation failed",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

#### 401 Unauthorized - Invalid Token
```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "details": {}
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "status": "error",
  "message": "Admin access required",
  "details": {}
}
```

#### 404 Not Found
```json
{
  "status": "error",
  "message": "Patient not found",
  "details": {}
}
```

#### 409 Conflict - Duplicate Resource
```json
{
  "status": "error",
  "message": "Email already in use",
  "details": {}
}
```

#### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error",
  "details": {}
}
```

#### 503 Service Unavailable - Database Connection Failed
```json
{
  "status": "error",
  "message": "Database connection not available",
  "details": {}
}
```

---

## Request/Response Examples

### Example 1: Complete Patient Registration Flow

1. **Register Patient**
```bash
POST /api/v1/auth/register/patient
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+911234567890",
  "age": 30,
  "gender": "male",
  "bloodGroup": "O+",
  "allergies": [
    {
      "name": "Peanut",
      "severity": "severe"
    }
  ]
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {...},
    "patient": {...}
  }
}
```

2. **Use token for subsequent requests**
```bash
GET /api/v1/patient/health
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Example 2: Share Token Access Flow

1. **Patient creates share token**
```bash
POST /api/v1/patient/share-tokens
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "scope": ["reports", "health_data"],
  "accessLevel": "doctor",
  "doctorId": "550e8400-e29b-41d4-a716-446655440020",
  "expiresAt": "2026-05-08T10:00:00Z"
}
```

Response includes token: `qwejef123xyz` and QR code

2. **Doctor accesses shared data**
```bash
POST /api/v1/share/qwejef123xyz/access
Content-Type: application/json

{
  "accessorEmail": "doctor@hospital.com"
}
```

Response includes only specified scope data

---

## Rate Limiting

Currently, no API rate limiting is implemented. Future versions will include:
- Per-endpoint rate limits
- IP-based throttling
- Token-based quotas

---

## Deployment Notes

### Environment Variables Required
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
BASE_URL=http://localhost:3000
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
NODE_ENV=production
```

### Vercel Deployment
- Max function duration: 30 seconds
- Memory: 1024MB
- Request timeout: 25 seconds
- Database pool (serverless): max 2, min 0

---

## Support & Troubleshooting

### Common Issues

**Issue**: API returns 503 Service Unavailable
- **Solution**: Check DATABASE_URL and ensure database is accessible

**Issue**: Upload fails with 500 error
- **Solution**: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured

**Issue**: Token expires frequently
- **Solution**: Check JWT_SECRET is consistent across deployments

---

**Document Version**: 1.0.0  
**Last Updated**: May 1, 2026  
**API Status**: Production Ready
