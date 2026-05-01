import serverless from 'serverless-http';

console.log('[API] Handler loading...');

// Lazy-load app to prevent module load hanging
let appModule: any = null;
let handler: any = null;

function loadApp() {
  if (appModule) return appModule;

  console.log('[API] Loading app...');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  appModule = require('../src/app');
  console.log('[API] App loaded successfully');
  return appModule;
}

function getHandler() {
  if (handler) return handler;

  try {
    const app = loadApp().app;
    
    // Add timeout middleware to app
    app.use((req: any, res: any, next: any) => {
      // Hard timeout for each request
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error(`[TIMEOUT] Request exceeded 15s: ${req.method} ${req.path}`);
          res.status(503).json({ error: 'Request timeout' });
        }
      }, 15000);

      res.on('finish', () => clearTimeout(timeout));
      res.on('close', () => clearTimeout(timeout));

      next();
    });

    handler = serverless(app);
    return handler;
  } catch (error) {
    console.error('[API] Handler creation error:', error);
    throw error;
  }
}

console.log('[API] Handler module ready');

export default async (req: any, res: any) => {
  try {
    // Fast-path: health endpoint without full app
    if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Route to full app with timeout
    const handler = getHandler();
    const timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        console.error('[HANDLER TIMEOUT] Function timeout');
        res.statusCode = 503;
        res.end(JSON.stringify({ error: 'Service timeout' }));
      }
    }, 18000); // 18 seconds max

    try {
      return await handler(req, res);
    } finally {
      clearTimeout(timeoutHandle);
    }
  } catch (error) {
    console.error('[API] Error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
};