import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Load server/.env if it exists. Values already set in the shell win.
const envFile = fileURLToPath(new URL('../../.env', import.meta.url));
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const DEV_JWT_SECRET = 'local-dev-secret-do-not-use-in-production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

const defaultMongoUri = isTest
  ? 'mongodb://127.0.0.1:27017/fullstack-todo-app-test'
  : 'mongodb://127.0.0.1:27017/fullstack-todo-app';

const env = {
  nodeEnv,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 4000,
  // Tests always use their own database so they never touch real data.
  mongoUri: isTest ? process.env.MONGO_URI_TEST || defaultMongoUri : process.env.MONGO_URI || defaultMongoUri,
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;
