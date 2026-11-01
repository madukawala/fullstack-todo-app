// Config for migrate-mongo. Reuses the same env loading as the API,
// so migrations always run against the same database the app uses.
import env from './src/config/env.js';

const url = new URL(env.mongoUri);
const databaseName = url.pathname.replace(/^\//, '') || 'fullstack-todo-app';

const config = {
  mongodb: {
    url: env.mongoUri,
    databaseName,
    options: {},
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  lockCollectionName: 'changelog_lock',
  lockTtl: 0,
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'esm',
};

export default config;
