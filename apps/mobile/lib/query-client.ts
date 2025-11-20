import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});