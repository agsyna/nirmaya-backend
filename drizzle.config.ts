import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const connectionUrl = process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error('Missing database URL. Set DATABASE_URL.');
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionUrl,
  },
  verbose: true,
  strict: true,
});
