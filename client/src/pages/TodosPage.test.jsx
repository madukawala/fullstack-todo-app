import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse, renderWithProviders } from '../test/utils.jsx';
import TodosPage from './TodosPage.jsx';

const user = { _id: 'u1', name: 'Admin', email: 'admin@todo.app' };
const now = new Date().toISOString();
const existingTodo = { _id: 't1', title: 'Write tests', description: '', done: false, createdAt: now, updatedAt: now };

// Routes fetch calls by method + path so each test can override only what it cares about.
function mockApi(overrides = {}) {
  const routes = {
    'GET /api/auth/me': () => jsonResponse({ user }),
    'GET /api/todos': () => jsonResponse([existingTodo]),
    ...overrides,
  };
  fetch.mockImplementation((url, options = {}) => {
    const key = `${options.method || 'GET'} ${url}`;
    const handler = routes[key];
    if (!handler) throw new Error(`No mock for ${key}`);
    return handler(options);
  });
}

describe('TodosPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.setItem('todo-app.token', 'token');
  });

  it('lists todos from the API', async () => {
    mockApi();
    renderWithProviders(<TodosPage />);

    expect(await screen.findByText('Write tests')).toBeInTheDocument();
  });

  it('shows a new todo straight away, before the server responds', async () => {
    let resolveCreate;
    mockApi({
      'POST /api/todos': () => new Promise((resolve) => (resolveCreate = resolve)),
    });
    renderWithProviders(<TodosPage />);
    await screen.findByText('Write tests');

    await userEvent.type(screen.getByPlaceholderText('What needs to be done?'), 'Ship it{Enter}');

    // Visible while the request is still pending.
    expect(screen.getByText('Ship it')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    resolveCreate(
      new Response(JSON.stringify({ ...existingTodo, _id: 't2', title: 'Ship it' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await waitFor(() => expect(screen.queryByText('Saving...')).not.toBeInTheDocument());
  });

  it('does not submit an empty todo', async () => {
    mockApi();
    renderWithProviders(<TodosPage />);
    await screen.findByText('Write tests');

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith('/api/todos', expect.objectContaining({ method: 'POST' }));
  });

  it('puts a todo back if deleting it fails', async () => {
    mockApi({
      'DELETE /api/todos/t1': () => jsonResponse({ message: 'Server is having a bad day.' }, 500),
    });
    renderWithProviders(<TodosPage />);
    const item = (await screen.findByText('Write tests')).closest('li');

    await userEvent.click(within(item).getByRole('button', { name: 'Delete "Write tests"' }));
    await userEvent.click(await within(item).findByRole('button', { name: 'Yes' }));

    expect(await screen.findByText(/Could not delete the todo/)).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });
});
