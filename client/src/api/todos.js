import { request } from './client.js';

export const todosApi = {
  list: (signal) => request('/todos', { signal }),
  create: (todo) => request('/todos', { method: 'POST', body: todo }),
  update: (id, changes) => request(`/todos/${id}`, { method: 'PUT', body: changes }),
  // We send the target value instead of a bare toggle so retries and double clicks stay predictable.
  setDone: (id, done) => request(`/todos/${id}/done`, { method: 'PATCH', body: { done } }),
  remove: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
};
