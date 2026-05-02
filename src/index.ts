
import { app } from './app';
import { env } from './config/env';

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
	app.listen(env.port, () => {
		console.log(`API server listening on port ${env.port}`);
	});
}
export default app;

