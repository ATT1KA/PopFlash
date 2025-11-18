import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useMemo } from 'react';

const createClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        retry: 1,
      },
    },
  });

export function AppProvider({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => createClient(), []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
