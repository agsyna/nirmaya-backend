# Nirmaya Backend

Backend API for Nirmaya, a medical records platform for patients, doctors, and admins. It handles patient onboarding, health profiles, medical documents, access requests, emergency sharing, and audit trails.

## What It Does

- Patient authentication with JWT-based sessions.
- Patient profile, health metrics, nominees, emergency SOS, reports, and prescriptions.
- Doctor access-request workflow for requesting patient data access.
- Admin workflows for doctor registration and patient management.
- Share-token based medical data access with QR-code support.
- Supabase-backed file uploads for reports, prescriptions, scans, and other records.
- PostgreSQL schema and migrations managed with Drizzle.
- Swagger UI exposed at `/api-docs`.
- Health checks at `/health` with database and Supabase status.

## Stack

- Node.js 22, Express, TypeScript
- PostgreSQL with Drizzle ORM
- Supabase Storage
- JWT auth, bcrypt password hashing
- Zod request validation
- Vercel serverless entrypoint

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The local server defaults to `http://localhost:3000`.

## Environment

Required for a working API:

- `DATABASE_URL` - PostgreSQL connection string.
- `JWT_SECRET` - signing secret for access tokens.
- `BASE_URL` - public API base URL used for generated links and Swagger.
- `CORS_ORIGIN` - comma-separated frontend origins allowed by CORS.

Required for file uploads:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`

See `.env.example` for the complete list and local defaults.

## Database

Schema lives in `src/schema`. Migrations are stored in `drizzle`.

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

`drizzle.config.ts` reads `DATABASE_URL`.

## API Surface

All versioned routes are mounted under `/api/v1`.

- `POST /auth/register/patient`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /patient/me`
- `GET|POST /patient/health`
- `GET|POST|PUT /patient/nominees`
- `GET|POST|PUT|DELETE /patient/reports`
- `GET|POST|PUT|DELETE /patient/prescriptions`
- `GET /patient/audit-logs`
- `POST|GET|PUT /patient/emergency`
- `POST /patient/uploads/file`
- `POST /patient/uploads/sign`
- `POST /patient/uploads/finalize`
- `POST|GET|DELETE /patient/share-tokens`
- `POST /share/:token/access`
- `POST /doctor/access-request`
- `GET /doctor/access-requests`
- `POST /admin/doctors`
- `GET|PUT|DELETE /admin/patients`

Use `/api-docs` for request and response details generated from route annotations.

## Production

```bash
npm run build
npm start
```

For Vercel, `api/index.ts` exports the Express app and `vercel.json` routes `/api/*` to the serverless function. Set production environment variables in the Vercel dashboard before deployment.

