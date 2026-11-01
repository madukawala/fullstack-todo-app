// Small fetch wrapper used by every API call.
// - adds the JSON headers and the auth token
// - turns non-2xx responses into an ApiError with a message that is safe to show to users

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'todo-app.token';

export class ApiError extends Error {
  constructor(message, { status = 0, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// The auth context registers a callback here so any 401 logs the user out.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

const FALLBACK_MESSAGES = {
  403: 'You do not have permission to do that.',
  404: 'We could not find what you were looking for.',
  429: 'You are going a bit fast. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again.',
};

// Bad gateway / unavailable / timeout usually means the API itself is down.
const SERVER_DOWN_MESSAGE = 'Cannot reach the server. Please check your connection and try again.';
[502, 503, 504].forEach((status) => {
  FALLBACK_MESSAGES[status] = SERVER_DOWN_MESSAGE;
});

export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(SERVER_DOWN_MESSAGE);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || FALLBACK_MESSAGES[response.status] || FALLBACK_MESSAGES[500];

    // A 401 on the login call just means wrong credentials, not an expired session.
    if (response.status === 401 && path !== '/auth/login') {
      onUnauthorized(message);
    }

    throw new ApiError(message, { status: response.status, details: data?.details });
  }

  return data;
}
