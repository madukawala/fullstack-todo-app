import { request } from './client.js';

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  me: (signal) => request('/auth/me', { signal }),
};
