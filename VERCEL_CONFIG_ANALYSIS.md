# Vercel Configuration Analysis & Fixes

## Issues Found

### 1. **Missing Function Duration Configuration**
**Problem**: The original `vercel.json` had no `maxDuration` setting, which could cause issues with long-running functions or timeouts.
- Vercel Hobby plan: 60 second max
- Vercel Pro plan: 900 second max
- Without explicit config, default timeouts apply

**Fix**: Added `maxDuration: 30` to the build config, leaving a 5-second buffer before Vercel's 30-second timeout (Pro plan).

### 2. **Inadequate Request/Response Timeout Handling**
**Problem**: Express app wasn't setting timeout limits, leading to indefinite waiting.
- Requests could hang without explicit timeout
- No error handling for timeout scenarios
- Serverless functions need aggressive timeout management

**Fix**: 
- Added request/response timeout middleware (25 seconds)
- Added error handler for ETIMEDOUT and EHOSTUNREACH errors
- Ensures responses are sent before Vercel's hard timeout

### 3. **Oversized Database Connection Pool for Serverless**
**Problem**: PostgreSQL connection pool configured with 5 connections in production.
- Vercel serverless spawns new function instances
- Each instance gets its own pool → connection exhaustion
- Idle connections hanging on cold starts
- 3000ms connection timeout too aggressive

**Fix**:
- Reduced `max` connections from 5 to 2
- Set `min: 0` (no persistent connections in production)
- Reduced `idleTimeoutMillis` from 10s to 5s
- Reduced `connectionTimeoutMillis` from 3s to 2s
- Reduced `statement_timeout` from 10s to 8s
- Added `query_timeout` for explicit query limit
- Enabled keepalives with short idle interval

### 4. **Missing Memory Configuration**
**Problem**: No explicit memory allocation in Vercel function config.
- Default might be insufficient for Node.js runtime + dependencies
- Can cause slowness due to memory pressure

**Fix**: Added `memory: 1024` (1GB) to function configuration.

### 5. **Route Configuration Could Be More Specific**
**Problem**: Generic catch-all route might include unnecessary processing.

**Fix**: Added explicit route for `/health` endpoint with GET method only to ensure fast response.

## Configuration Changes Summary

### vercel.json
```json
{
  "builds": [
    {
      "config": {
        "maxDuration": 30,    // NEW
        "memory": 1024        // NEW
      }
    }
  ],
  "routes": [
    {
      "src": "/health",      // NEW - explicit route
      "dest": "/api/index.ts",
      "methods": ["GET"]
    }
  ]
}
```

### api/index.ts
```typescript
// NEW: Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(25000);
  res.setTimeout(25000);
  next();
});

// NEW: Timeout error handling
app.use((err, req, res, next) => {
  if (err.code === 'ETIMEDOUT' || err.code === 'EHOSTUNREACH') {
    return res.status(503).json({ error: 'Request timeout' });
  }
  next(err);
});
```

### src/db.ts
```typescript
const pool = new Pool({
  max: 2,                    // CHANGED from 5
  min: 0,                    // NEW - no persistent connections
  idleTimeoutMillis: 5000,   // CHANGED from 10000
  connectionTimeoutMillis: 2000,  // CHANGED from 3000
  statement_timeout: 8000,   // CHANGED from 10000
  query_timeout: 8000,       // NEW
  keepalives: true,          // NEW
  keepalivesIdle: 10,        // NEW
});
```

## Testing Recommendations

1. **Health Check**: 
   ```bash
   curl https://your-api.vercel.app/health
   ```
   Should respond immediately with status 200.

2. **API Response Times**:
   - Monitor Vercel deployment logs
   - Check function duration in Vercel dashboard
   - Expected: Most requests < 5 seconds

3. **Cold Start Performance**:
   - Disable function caching in Vercel dashboard
   - Invoke API after a gap to trigger cold start
   - Should complete within 10 seconds

4. **Database Connection**:
   - Monitor connection pool in PostgreSQL logs
   - Verify no connection exhaustion errors
   - Check idle timeout behavior

## Environment Variables Verification

Ensure these are set in Vercel project settings:
- `DATABASE_URL` - PostgreSQL connection string (with connection limit consideration)
- `JWT_SECRET` - Secret key for token signing
- `CORS_ORIGIN` - Allowed frontend URLs
- `BASE_URL` - API base URL for Swagger docs
- `NODE_ENV` - Should be "production"

## Potential Further Optimizations

If issues persist:

1. **Connection Pooling**: Consider PgBouncer or AWS RDS Proxy for connection pooling
2. **Database Query Optimization**: Use indexes and query analysis
3. **Cache Layer**: Add Redis caching for frequently accessed data
4. **Edge Functions**: Use Vercel Edge Functions for ultra-low latency endpoints
5. **Monitoring**: Set up Vercel error tracking and APM
