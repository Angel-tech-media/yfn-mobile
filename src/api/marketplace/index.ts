import { http } from '@/src/lib/http';

import type {
  MarketplaceHomeQuery,
  MarketplaceHomeResponse,
  MarketplaceNearbyQuery,
  MarketplaceNearbyResponse,
  TopRatedQuery,
  TopRatedResponse,
} from '../types';

export const marketplaceApi = {
  home(query: MarketplaceHomeQuery = {}) {
    return http.get<MarketplaceHomeResponse>('/marketplace/home', { query });
  },

  nearby(query: MarketplaceNearbyQuery) {
    return http.get<MarketplaceNearbyResponse>('/marketplace/nearby', { query });
  },

  topRated(query: TopRatedQuery = {}) {
    return http.get<TopRatedResponse>('/marketplace/top-rated', { query });
  },
};
