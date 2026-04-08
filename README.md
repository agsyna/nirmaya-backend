# Backend API Setup

## Environment

Set these environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` optionally, defaults to `1d`
- `PORT` optionally, defaults to `3000`

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## API Routes

- `POST /api/auth/register/patient`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/admin/doctors` protected by JWT admin middleware

## Notes

- JWT access tokens are used for auth.
- No refresh token flow is implemented.
- Doctor registration is restricted to admin-only access.
- `POST /api/auth/forgot-password` returns a reset token in development so the flow can be tested without email integration.
- Seed at least one admin user by inserting a `users` row with `type = 'admin'` and a matching `admins` row.
