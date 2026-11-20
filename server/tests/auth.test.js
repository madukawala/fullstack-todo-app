import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import User from '../src/models/User.js';
import { app, createUserAndLogin, resetDatabase, setupDatabase, teardownDatabase } from './helpers.js';

describe('Auth API', () => {
  before(setupDatabase);
  beforeEach(resetDatabase);
  after(teardownDatabase);

  it('logs in with valid credentials and never returns the password', async () => {
    await User.create({ name: 'Admin', email: 'admin@todo.app', password: 'Abc@123', role: 'admin' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'Admin@Todo.app ', password: 'Abc@123' })
      .expect(200);

    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'admin@todo.app');
    assert.equal(res.body.user.password, undefined);
  });

  it('rejects a wrong password with a generic message', async () => {
    await User.create({ name: 'Admin', email: 'admin@todo.app', password: 'Abc@123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@todo.app', password: 'wrong-pass' })
      .expect(401);

    assert.equal(res.body.message, 'Incorrect email or password.');
  });

  it('returns field errors for an invalid login form', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope' }).expect(400);

    assert.ok(res.body.details.email);
    assert.ok(res.body.details.password);
  });

  it('returns the current user for a valid token', async () => {
    const { token } = await createUserAndLogin();

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    assert.equal(res.body.user.email, 'tester@todo.app');
  });

  it('rejects requests with a bad token', async () => {
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token').expect(401);
  });
});
