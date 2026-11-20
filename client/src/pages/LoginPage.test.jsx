import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse, renderWithProviders } from '../test/utils.jsx';
import LoginPage from './LoginPage.jsx';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<p>Todos page</p>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows validation messages without calling the API', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows the server message when the credentials are wrong', async () => {
    fetch.mockReturnValueOnce(jsonResponse({ message: 'Incorrect email or password.' }, 401));
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'admin@todo.app');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-pass');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument();
  });

  it('stores the token and redirects after a successful login', async () => {
    fetch.mockReturnValueOnce(
      jsonResponse({ token: 'abc.def.ghi', user: { _id: '1', name: 'Admin', email: 'admin@todo.app' } }),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'admin@todo.app');
    await userEvent.type(screen.getByLabelText('Password'), 'Abc@123');
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Todos page')).toBeInTheDocument();
    expect(localStorage.getItem('todo-app.token')).toBe('abc.def.ghi');
  });
});
