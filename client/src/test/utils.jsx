import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter } from 'react-router-dom';
import { createQueryClient } from '../queryClient.js';
import { AuthProvider } from '../context/AuthContext.jsx';

export function renderWithProviders(ui, { route = '/', queryClient = createQueryClient() } = {}) {
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
        <Toaster />
      </QueryClientProvider>,
    ),
  };
}

export function jsonResponse(body, status = 200) {
  return Promise.resolve(
    new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}
