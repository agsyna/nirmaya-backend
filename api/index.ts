import serverless from 'serverless-http';
import { app } from '../dist/src/app.js';

export default serverless(app);