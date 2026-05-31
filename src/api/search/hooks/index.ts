import { useQuery } from '@tanstack/react-query';

import { searchApi } from '..';
import { queryKeys } from '../../query-keys';

import type { SearchQuery } from '../../types';

export function useSearch(params: Omit<SearchQuery, 'q'> & { q?: string }) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    enabled: !!params.q?.trim(),
    queryFn: () => searchApi.search({ ...params, q: params.q! }),
    staleTime: 15_000,
  });
}
