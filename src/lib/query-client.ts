import { QueryClient } from '@tanstack/react-query';

import { CACHE_TIME, STALE_TIME } from '../constants/cache.constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: CACHE_TIME,
      retry: 1,
      staleTime: STALE_TIME,
    },
    mutations: {
      retry: 0,
    },
  },
});
