import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retry network blips, but not client errors like 401/404.
        retry: (failureCount, error) => failureCount < 2 && !(error.status >= 400 && error.status < 500),
      },
      mutations: { retry: false },
    },
  });
}
