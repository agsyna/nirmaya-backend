# Nirmaya Medical Records API - Complete Real Implementation Documentation

## Base Configuration

- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer Token
- **Error Formats**: Standardized JSON wrapped via `errorHandler.ts`
- **Application Port**: Defined by environment configuration

---

## Authentication

### Standard Response Objects
Common definitions across the application logic. All API JSON responses abide by the standard wrapper configuration inside `utils/appError.ts` / express `res.json()`.

```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional contextual message string"
}
```

---

## Public General Routes

### `GET /health`
System health check endpoint ensuring DB, Supabase, and Environmental stability.
- **Auth required:** None


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "status": "Healthy",
    "timestamp": "2026-05-03T12:00:00.000Z",
    "database": "Connected",
    "environment": "production",
    "uptime": 123456.78
  }
}
```
---

## Authentication (`/api/v1/auth`)

### `POST /auth/register/patient`
Register a new patient account and initialize them within the DB `users` and `patients` schema blocks.

**Request Body** *(Derived from `auth.validators.ts`)*:
```json
{
  "name": "Jane Example",
  "email": "jane@example.com",
  "password": "Password123!",
  "phone": "+1234567890",
  "age": 35,
  "gender": "female",
  "bloodGroup": "O+",
  "height": 165,
  "weight": 60,
  "allergies": [
    {
      "name": "Peanut",
      "severity": "severe",
      "description": "Detailed allergy notes"
    }
  ],
  "chronicConditions": [
    {
      "name": "Asthma",
      "diagnosisDate": "2020-01-15",
      "status": "active",
      "notes": "Mild inhaler usage"
    }
  ],
  "emergencyContacts": [
    {
      "name": "Dad Example",
      "phone": "+1987654321",
      "relationship": "parent",
      "priority": 1
    }
  ]
}
```
**Notes:** `phone`, `age`, `gender`, `bloodGroup`, `height`, `weight`, `allergies`, `chronicConditions`, and `emergencyContacts` are strictly optional.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "name": "Jane Example",
      "role": "patient",
      "createdAt": "2026-05-03T12:00:00.000Z"
    },
    "patient": {
      "id": "uuid",
      "userId": "uuid",
      "age": 35,
      "gender": "female",
      "bloodGroup": "O+"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```
### `POST /auth/login`
Authenticate user identity against database constraints.

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "name": "Jane Example",
      "role": "patient"
    },
    "patient": {
      "id": "uuid",
      "userId": "uuid"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```
### `POST /auth/forgot-password`
Request magic password reset link capabilities via email delivery trigger.

**Request Body**:
```json
{
  "email": "jane@example.com"
}
```


**Response Object**:
```json
{
  "status": "success",
  "message": "If an account exists with this email, a reset token has been generated.",
  "data": {
    "resetToken": "generated-reset-token-or-null"
  }
}
```
### `POST /auth/reset-password`
Reset the patient's password securely completing the `forgot-password` loop.

**Request Body**:
```json
{
  "token": "PROVIDED_RESET_TOKEN",
  "password": "NewSecurePassword123!"
}
```


**Response Object**:
```json
{
  "status": "success",
  "message": "Password reset successful.",
  "data": null
}
```
---

## Patient Endpoints (`/api/v1/patient`)

**Authorization Header Constraint**: `Authorization: Bearer <your_jwt_here>` strictly mandated by the `authenticate` middleware. Restricted specifically to the 'patient' level role.

### Profile & Vitals

#### `GET /patient/me`
Pull completely normalized authenticated patient profile information.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "name": "Jane Example",
      "role": "patient"
    },
    "patient": {
      "id": "uuid",
      "userId": "uuid",
      "age": 35,
      "gender": "female",
      "bloodGroup": "O+",
      "height": 165,
      "weight": 60,
      "emergencySosEnabled": true
    },
    "qrCode": {
      "id": "uuid",
      "url": "https://api.example.com/qr/uuid"
    }
  }
}
```
#### `GET /patient/health`
Get an absolute history array of tracked vital metrics across the patient's records history.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "patient": {
      "id": "uuid",
      "bloodGroup": "O+",
      "height": 165,
      "weight": 60
    },
    "healthData": [
      {
        "id": "uuid",
        "bloodPressure": "120/80",
        "bloodGlucose": 95,
        "heartRate": 75,
        "temperature": 98.6,
        "weight": 65,
        "recordedAt": "2023-10-31T09:00:00Z"
      }
    ],
    "allergies": [
      {
        "id": "uuid",
        "name": "Peanut",
        "severity": "severe"
      }
    ],
    "chronicConditions": [
      {
        "id": "uuid",
        "name": "Asthma",
        "status": "active"
      }
    ]
  }
}
```
#### `POST /patient/health`
Submit/Log a brand new health telemetry reading mapping straight into the `healthData` database schema.

**Request Body** *(Derived from `patient.validators.ts`)*:
```json
{
  "bloodPressure": "120/80",
  "bloodGlucose": 95,
  "heartRate": 75,
  "temperature": 98.6,
  "weight": 65,
  "notes": "Felt completely ordinary today.",
  "recordedAt": "2023-10-31T09:00:00Z"
}
```
*Note: All keys here are universally optional.*



**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "bloodPressure": "120/80",
    "bloodGlucose": 95,
    "heartRate": 75,
    "temperature": 98.6,
    "weight": 65,
    "notes": "Felt completely ordinary today.",
    "recordedAt": "2023-10-31T09:00:00.000Z",
    "createdAt": "2026-05-03T12:00:00.000Z"
  }
}
```
### Reporting & Clinical File Storage

#### `GET /patient/reports`
Return all associated clinical reports filed locally securely for that user UUID.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "type": "report",
      "title": "Complete Blood Count",
      "fileUrl": "https://<supabase-or-s3>/bucket/path",
      "privacy": "private",
      "documentDate": "2026-05-02T10:00:00Z",
      "createdAt": "2026-05-03T12:00:00Z"
    }
  ]
}
```
#### `POST /patient/reports`
Establish a new clinical Document pointer mapped to database tracking.

**Request Body**:
```json
{
  "type": "report", 
  "title": "Complete Blood Count",
  "fileUrl": "https://<supabase-or-s3>/bucket/path_reference",
  "originalContent": "Raw OCR content optional data",
  "documentDate": "2026-05-02T10:00:00Z",
  "privacy": "private",
  "metadata": {}
}
```
*(Valid `type` values: "prescription", "report", "scan", "vaccination", "other")*


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "type": "report",
    "title": "Complete Blood Count",
    "fileUrl": "https://<supabase-or-s3>/bucket/path",
    "originalContent": "Raw OCR content optional data",
    "privacy": "private",
    "documentDate": "2026-05-02T10:00:00Z",
    "metadata": {},
    "createdAt": "2026-05-03T12:00:00Z"
  }
}
```
#### `PUT /patient/reports/:reportId`
Patch modification updates into existing document tracking logs recursively.
*(Takes partial body mappings of the `POST` interface)*


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "type": "report",
    "title": "Updated Complete Blood Count",
    "privacy": "shared",
    "updatedAt": "2026-05-03T12:05:00Z"
  }
}
```
#### `DELETE /patient/reports/:reportId`
Obliterate a specific clinical report securely.


**Response Object**:
```json
{
  "status": "success",
  "message": "Report securely deleted.",
  "data": null
}
```
---

### Prescriptions Tracker

#### `GET /patient/prescriptions`
Fetch a list of exclusively loaded prescription tracking sheets.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "type": "prescription",
      "title": "Antibiotics Prescription",
      "fileUrl": "https://<supabase-or-s3>/bucket/path",
      "privacy": "private",
      "createdAt": "2026-05-03T12:00:00Z"
    }
  ]
}
```
#### `POST /patient/prescriptions`
Upload clinical prescription referencing. (Shares mapping fields with reporting structures).


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "type": "prescription",
    "title": "Antibiotics Prescription",
    "fileUrl": "https://<supabase-or-s3>/bucket/path",
    "privacy": "private",
    "createdAt": "2026-05-03T12:00:00Z"
  }
}
```
#### `PUT /patient/prescriptions/:prescriptionId`
Patch updates into specific prescription IDs incrementally.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Updated Antibiotics Prescription",
    "updatedAt": "2026-05-03T12:05:00Z"
  }
}
```
#### `DELETE /patient/prescriptions/:prescriptionId`
Oblatarate a specific clinical prescription entirely by UUID.


**Response Object**:
```json
{
  "status": "success",
  "message": "Prescription securely deleted.",
  "data": null
}
```
---

### Emergency Operations SOS

#### `POST /patient/emergency`
Trigger a physical emergency broadcasting system alert directly referencing the `emergencySos` repository structures. When scanning an affected person's QR code, pass their userId to retrieve and display critical health information instantly.

**Request Body**:
```json
{
  "affectedPatientId": "uuid-of-affected-person",
  "latitude": "40.7128",
  "longitude": "-74.0060",
  "serviceType": "ambulance",
  "description": "Car accident on Main Street, person unconscious",
  "ambulanceCalled": true,
  "voiceMessageSent": false,
  "contactsNotified": ["<uuid-of-contact-1>", "<uuid-of-contact-2>"]
}
```
*Notes: `affectedPatientId` and `serviceType` are required. Valid `serviceType` values: "ambulance", "police", "fire", "medical-support", "other". All other fields are optional.*


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "sosId": "uuid",
    "patientId": "uuid",
    "affectedPatientId": "uuid",
    "status": "active",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "serviceType": "ambulance",
    "description": "Car accident on Main Street, person unconscious",
    "ambulanceCalled": true,
    "voiceMessageSent": false,
    "affectedPatientProfile": {
      "age": 35,
      "gender": "female",
      "bloodGroup": "O+",
      "height": 165,
      "weight": 60
    },
    "criticalInfoShared": {
      "bloodGroup": "O+",
      "age": 35,
      "gender": "female",
      "height": 165,
      "weight": 60,
      "allergies": [
        {
          "name": "Peanut",
          "severity": "severe",
          "description": "Detailed allergy notes"
        }
      ],
      "chronicConditions": [
        {
          "name": "Asthma",
          "status": "active",
          "diagnosisDate": "2020-01-15",
          "notes": "Mild inhaler usage"
        }
      ],
      "latestHealthData": {
        "id": "uuid",
        "bloodPressure": "120/80",
        "bloodGlucose": 95,
        "heartRate": 75,
        "temperature": 98.6,
        "weight": 65,
        "recordedAt": "2026-05-03T09:00:00Z"
      }
    },
    "createdAt": "2026-05-03T12:00:00Z",
    "message": "Emergency SOS activated. Emergency contacts are being notified."
  }
}
```
#### `GET /patient/emergency`
Pull physical SOS history log timestamps structurally over time, including affected patient profile summaries.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "sosId": "uuid",
      "status": "resolved",
      "serviceType": "ambulance",
      "description": "Car accident",
      "latitude": "40.7128",
      "longitude": "-74.0060",
      "ambulanceCalled": true,
      "ambulanceEta": 8,
      "voiceMessageSent": false,
      "affectedPatientProfile": {
        "age": 35,
        "gender": "female",
        "bloodGroup": "O+"
      },
      "createdAt": "2026-04-01T10:00:00Z",
      "resolvedAt": "2026-04-01T12:00:00Z"
    }
  ],
  "meta": {
    "count": 1,
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```
#### `GET /patient/emergency/:sosId`
Return verbose detail map of specific SOS triggering identifier with complete health summary of affected person.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "sosId": "uuid",
    "status": "active",
    "latitude": "40.7128",
    "longitude": "-74.0060",
    "serviceType": "ambulance",
    "description": "Car accident on Main Street, person unconscious",
    "ambulanceCalled": true,
    "ambulanceEta": 8,
    "contactsNotified": ["uuid1", "uuid2"],
    "voiceMessageSent": false,
    "affectedPatientProfile": {
      "age": 35,
      "gender": "female",
      "bloodGroup": "O+",
      "height": 165,
      "weight": 60
    },
    "latestHealthData": {
      "id": "uuid",
      "bloodPressure": "120/80",
      "bloodGlucose": 95,
      "heartRate": 75,
      "temperature": 98.6,
      "weight": 65,
      "recordedAt": "2026-05-03T09:00:00Z"
    },
    "criticalInfoShared": {
      "bloodGroup": "O+",
      "age": 35,
      "gender": "female",
      "height": 165,
      "weight": 60,
      "allergies": [
        {
          "name": "Peanut",
          "severity": "severe",
          "description": "Detailed allergy notes"
        }
      ],
      "chronicConditions": [
        {
          "name": "Asthma",
          "status": "active",
          "diagnosisDate": "2020-01-15",
          "notes": "Mild inhaler usage"
        }
      ]
    },
    "createdAt": "2026-05-03T12:00:00Z",
    "resolvedAt": null
  }
}
```
#### `PUT /patient/emergency/:sosId`
Amend active status flags across initialized active emergency states. (e.g. resolve event status updates).


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "status": "resolved",
    "resolvedAt": "2026-05-03T14:00:00Z",
    "updatedAt": "2026-05-03T14:00:00Z"
  }
}
```
---

### Share Tokens Generator (`/api/v1/patient/share-tokens`)
Manages generating unique viewing windows explicitly for clinical access parameters explicitly restricted to your access definitions.

#### `POST /patient/share-tokens`
Construct an isolated data sharing capability reference token securely.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "scope": ["reports", "prescriptions"],
    "accessLevel": "doctor",
    "expiresAt": "2026-05-10T12:00:00Z",
    "createdAt": "2026-05-03T12:00:00Z"
  }
}
```
#### `GET /patient/share-tokens`
List historically requested sharing configurations.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "scope": ["reports"],
      "accessLevel": "public",
      "expiresAt": "2026-05-10T12:00:00Z",
      "isActive": true,
      "createdAt": "2026-05-03T12:00:00Z"
    }
  ]
}
```
#### `DELETE /patient/share-tokens/:tokenId`
Forced revocation capabilities manually ending access prematurely globally bypassing time delays.


**Response Object**:
```json
{
  "status": "success",
  "message": "Share token revoked gracefully.",
  "data": null
}
```
---

### Access Tracking & Security Audits

#### `GET /patient/audit-logs`
Observe standard interaction records associated with physical actions within database records.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "action": "view",
      "status": "success",
      "accessedRecordId": "uuid",
      "createdAt": "2026-05-03T11:00:00Z"
    }
  ]
}
```
#### `GET /patient/access-logs`
Observe standard security validations generated by Share Tokens mapping third-party access identifiers against local viewing.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "shareTokenId": "uuid",
      "action": "view",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-05-03T11:00:00Z"
    }
  ]
}
```
#### `POST /patient/access-logs`
Allow applications to register custom Access manual markers against token viewing interactions natively.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "shareTokenId": "uuid",
    "action": "download",
    "createdAt": "2026-05-03T12:00:00Z"
  }
}
```
#### `PUT /patient/access-logs/:accessLogId`
Ability for tracking controllers to update status blocks across access log identifiers incrementally.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "status": "success",
    "updatedAt": "2026-05-03T12:05:00Z"
  }
}
```
---

### External Uploading Handling (`/api/v1/patient/uploads`)
Supabase/S3 Storage Interaction Interfaces locally wrapped natively.

#### `POST /patient/uploads/file`
Upload file directly using physical local multer interception formatting mappings. Uses explicit `multipart/form-data`.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "bucket": "nirmaya-uploads",
    "path": "reports/uuid/document.pdf",
    "fileName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1048576,
    "fileUrl": "https://<supabase-or-s3>/bucket/reports/uuid/document.pdf"
  }
}
```
#### `POST /patient/uploads/sign`
Authorize an empty pre-signed secure blob window reference for your direct client-front-side implementations explicitly optimizing large data offloads securely.
**Request Body**:
```json
{
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "folder": "reports"
}
```
*(Folder Types limited strictly locally natively to: "reports", "prescriptions", "scans", "other")*


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "bucket": "nirmaya-uploads",
    "path": "reports/uuid/document.pdf",
    "signedUrl": "https://<supabase-or-s3>/bucket/reports/uuid/document.pdf?token=...",
    "token": "signature-token"
  }
}
```
#### `POST /patient/uploads/finalize`
Lock frontend successful uploads to system DB integration mappings natively structurally mimicking exactly the native `POST /reports` definition.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "type": "report",
    "title": "Complete Blood Count",
    "fileUrl": "https://<supabase-or-s3>/bucket/reports/uuid/document.pdf",
    "createdAt": "2026-05-03T12:00:00Z"
  }
}
```
---

## Admin Subsystem (`/api/v1/admin`)

*Strictly enforces both `authenticate` AND `requireAdmin` custom middlewares comprehensively mapped over endpoints native configurations globally.*

### `POST /admin/doctors`
Establish explicit Doctor role accounts administratively securely avoiding general registration pathways exclusively natively explicitly.

**Request Body**:
```json
{
  "name": "Dr Example",
  "email": "doctor@hospital.com",
  "password": "StrongPassword123!",
  "licenseNumber": "MED12345678",
  "specialization": "Cardiology",
  "phone": "+1234555666",
  "age": 45,
  "gender": "male",
  "bio": "Certified specialist details",
  "verified": true
}
```
*(Only `name`, `email`, `password`, `licenseNumber`, and `specialization` natively required)*


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "doctor@hospital.com",
      "name": "Dr Example",
      "role": "doctor"
    },
    "doctor": {
      "id": "uuid",
      "userId": "uuid",
      "licenseNumber": "MED12345678",
      "specialization": "Cardiology",
      "verified": true
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
}
```
### `GET /admin/patients`
Global patient index array pulling functionally for root system administrations.


**Response Object**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Jane Example",
      "email": "jane@example.com",
      "bloodGroup": "O+",
      "createdAt": "2026-05-03T10:00:00Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```
### `GET /admin/patients/:patientId`
Global direct patient view extraction targeting manually explicit parameters.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "name": "Jane Example"
    },
    "patient": {
      "id": "uuid",
      "age": 35,
      "gender": "female",
      "bloodGroup": "O+"
    }
  }
}
```
### `PUT /admin/patients/:patientId`
Direct absolute data administration mutator explicit bypass capabilities over standard limitations.


**Response Object**:
```json
{
  "status": "success",
  "message": "Patient records successfully updated via admin mutator.",
  "data": null
}
```
### `DELETE /admin/patients/:patientId`
Critical deletion handling permanently restricting account existence.


**Response Object**:
```json
{
  "status": "success",
  "message": "Patient explicitly obliterated from records.",
  "data": null
}
```
---

## Secure Public Viewing Engine (`/api/v1/share`)

#### `POST /share/:token/access`
Allow programmatic third parties natively verified validation across specific tokens accessing isolated payloads mapped tightly exclusively to scopes allocated independently locally natively structured securely inside Token middleware evaluations correctly.


**Response Object**:
```json
{
  "status": "success",
  "data": {
    "records": [],
    "patientContext": {
      "name": "Jane Example",
      "age": 35,
      "gender": "female"
    }
  },
  "meta": {
    "accessLevel": "doctor",
    "expiresAt": "2026-05-10T12:00:00Z"
  }
}
```