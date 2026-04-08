# Backend API Setup

## Environment

Copy `.env.example` to `.env` and configure these required variables:

- `DATABASE_URL` - PostgreSQL connection string (required in production)
- `JWT_SECRET` - Secure random secret key (required in production)
- `CORS_ORIGIN` - Comma-separated list of allowed origins
- `BASE_URL` - Application base URL
- `NODE_ENV` - `development` or `production` (defaults to `development`)
- `JWT_EXPIRES_IN` - Token expiration (defaults to `7d`)
- `PORT` - Server port (defaults to `3000`)

See `.env.example` for detailed configuration options.

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Database Setup

### Create migration (after schema changes)
```bash
npm run db:generate
npm run db:push
```

### View database
```bash
npm run db:studio
```

## Build for production

```bash
npm run build
node dist/src/index.js
```

## Vercel Deployment

This backend is configured for Vercel serverless deployment.

### Prerequisites
1. PostgreSQL database (use Supabase, AWS RDS, or similar)
2. Environment variables set in Vercel dashboard

### Deploy
```bash
vercel deploy
```

### Environment variables in Vercel
Set these in your Vercel project settings:
- `NODE_ENV=production`
- `DATABASE_URL=<your-production-db-url>`
- `JWT_SECRET=<strong-random-secret>`
- `CORS_ORIGIN=<your-frontend-url>`
- `BASE_URL=<your-api-url>`

### Important Notes for Serverless
- Database connections are optimized for serverless (max 10 connections)
- Request timeout is set to 25 seconds (Vercel limit is 30s)
- Health check endpoint: `GET /health`
- All environment variables must be set before deployment

## API Routes

- `POST /api/v1/auth/register/patient` - Register new patient
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/admin/doctors` - Add doctor (admin only, JWT required)
- `GET /health` - Health check

## Notes

- JWT access tokens are used for authentication
- No refresh token flow is implemented (future enhancement)
- Doctor registration is restricted to admin-only access
- `POST /api/v1/auth/forgot-password` returns a reset token in development for testing without email integration
- Seed at least one admin user:
  ```sql
  INSERT INTO users (id, email, password_hash, type) VALUES (...);
  INSERT INTO admins (user_id) VALUES (...);
  ```
- Production errors are logged but not exposed to clients (security best practice)

