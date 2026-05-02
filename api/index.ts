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
    const handler = getHandler();
    
    // Set hard timeout for the entire serverless function (27s, leaving 3s buffer for Vercel's 30s limit)
    const timeoutHandle = setTimeout(() => {
      if (!res.headersSent) {
        console.error('[HANDLER TIMEOUT] Function timeout after 27s');
        res.statusCode = 503;
        res.end(JSON.stringify({ status: 'error', message: 'Request timeout' }));
      }
    }, 27000);

    try {
      return await handler(req, res);
    } finally {
      clearTimeout(timeoutHandle);
    }
  } catch (error) {
    console.error('[API] Error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ status: 'error', message: 'Internal server error' }));
    }
  }
};