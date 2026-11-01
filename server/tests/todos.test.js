import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, createUserAndLogin, resetDatabase, setupDatabase, teardownDatabase } from './helpers.js';

describe('Todos API', () => {
  let token;
  const api = () => ({
    get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    patch: (url) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  });

  before(setupDatabase);
  beforeEach(async () => {
    await resetDatabase();
    ({ token } = await createUserAndLogin());
  });
  after(teardownDatabase);

  it('requires a token', async () => {
    await request(app).get('/api/todos').expect(401);
  });

  it('creates and lists todos, newest first', async () => {
    await api().post('/api/todos').send({ title: 'First' }).expect(201);
    const created = await api().post('/api/todos').send({ title: '  Second  ', description: 'Notes' }).expect(201);

    assert.equal(created.body.title, 'Second');
    assert.equal(created.body.done, false);
    assert.ok(created.body._id);
    assert.ok(created.body.createdAt);

    const list = await api().get('/api/todos').expect(200);
    assert.deepEqual(
      list.body.map((todo) => todo.title),
      ['Second', 'First'],
    );
  });

  it('validates the title', async () => {
    const res = await api().post('/api/todos').send({ title: '' }).expect(400);
    assert.equal(res.body.details.title, 'Title is required.');
  });

  it('updates title and description', async () => {
    const { body: todo } = await api().post('/api/todos').send({ title: 'Old' });

    const res = await api().put(`/api/todos/${todo._id}`).send({ title: 'New', description: 'Updated' }).expect(200);
    assert.equal(res.body.title, 'New');
    assert.equal(res.body.description, 'Updated');
  });

  it('toggles done, and can also set it explicitly', async () => {
    const { body: todo } = await api().post('/api/todos').send({ title: 'Toggle me' });

    const first = await api().patch(`/api/todos/${todo._id}/done`).expect(200);
    assert.equal(first.body.done, true);

    const second = await api().patch(`/api/todos/${todo._id}/done`).expect(200);
    assert.equal(second.body.done, false);

    const explicit = await api().patch(`/api/todos/${todo._id}/done`).send({ done: true }).expect(200);
    assert.equal(explicit.body.done, true);
  });

  it('deletes a todo', async () => {
    const { body: todo } = await api().post('/api/todos').send({ title: 'Remove me' });

    await api().delete(`/api/todos/${todo._id}`).expect(204);
    await api().delete(`/api/todos/${todo._id}`).expect(404);
  });

  it('returns 404 for an invalid id', async () => {
    await api().put('/api/todos/not-an-id').send({ title: 'x' }).expect(404);
  });

  it("does not let a user touch another user's todos", async () => {
    const { body: todo } = await api().post('/api/todos').send({ title: 'Private' });

    const other = await createUserAndLogin({ email: 'other@todo.app' });
    const asOther = (req) => req.set('Authorization', `Bearer ${other.token}`);

    const list = await asOther(request(app).get('/api/todos')).expect(200);
    assert.equal(list.body.length, 0);

    await asOther(request(app).put(`/api/todos/${todo._id}`))
      .send({ title: 'Hacked' })
      .expect(404);
    await asOther(request(app).delete(`/api/todos/${todo._id}`)).expect(404);
  });
});
