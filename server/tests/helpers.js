import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import env from '../src/config/env.js';
import User from '../src/models/User.js';

export const app = createApp();

export async function setupDatabase() {
  if (!env.mongoUri.includes('test')) {
    throw new Error(`Refusing to run tests against a non-test database: ${env.mongoUri}`);
  }
  await connectDatabase();
}

export async function resetDatabase() {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
}

export async function teardownDatabase() {
  await mongoose.connection.dropDatabase();
  await disconnectDatabase();
}

export async function createUserAndLogin(overrides = {}) {
  const credentials = { email: 'tester@todo.app', password: 'Secret@123', ...overrides };
  await User.create({ name: 'Tester', ...credentials });

  const res = await request(app).post('/api/auth/login').send(credentials);
  return { token: res.body.token, user: res.body.user };
}
