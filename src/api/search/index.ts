import { http } from '@/src/lib/http';

import type { SearchQuery, SearchResponse } from '../types';

export const searchApi = {
  search(query: SearchQuery) {
    return http.get<SearchResponse>('/search', { query });
  },
};
