import { useQuery } from '@tanstack/react-query';

import { marketplaceApi } from '..';
import { queryKeys } from '../../query-keys';

import type { MarketplaceHomeQuery, MarketplaceNearbyQuery, TopRatedQuery } from '../../types';

export function useMarketplaceHome(params: MarketplaceHomeQuery = {}) {
  return useQuery({
    queryKey: queryKeys.marketplace.home(params),
    queryFn: () => marketplaceApi.home(params),
    staleTime: 30_000,
  });
}

export function useNearby(
  params: Omit<MarketplaceNearbyQuery, 'lat' | 'lng'> & {
    lat: number | null;
    lng: number | null;
  },
) {
  return useQuery({
    queryKey: queryKeys.marketplace.nearby(params),
    enabled: params.lat !== null && params.lng !== null,
    queryFn: () =>
      marketplaceApi.nearby({
        ...params,
        lat: params.lat!,
        lng: params.lng!,
      }),
    staleTime: 15_000,
  });
}

export function useTopRatedVendors(params: TopRatedQuery = {}) {
  return useQuery({
    queryKey: queryKeys.marketplace.topRated(params),
    queryFn: () => marketplaceApi.topRated(params),
    staleTime: 60_000,
  });
}
