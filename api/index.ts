import serverless from 'serverless-http';

console.log('[API] Handler module loaded');

// Lazy-load app to prevent hanging during module init
let app: any = null;
let handler: any = null;

function getHandler() {
  if (handler) return handler;

  console.log('[API] Initializing app and handler...');
  try {
    // Dynamic import only when needed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appModule = require('../src/app');
    app = appModule.app;

    handler = serverless(app);
    console.log('[API] Handler ready');
    return handler;
  } catch (error) {
    console.error('[API] Init error:', error);
    throw error;
  }
}

export default (req: any, res: any) => {
  try {
    // Fast-path: health check without app
    if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) {
      console.log('[HEALTH] Direct response');
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ 
        status: 'ok',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Full app handler for all other routes
    console.log('[API] Route:', req.method, req.url);
    const handler = getHandler();
    handler(req, res);
  } catch (error) {
    console.error('[API] Error:', error);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal error' }));
    }
  }
};