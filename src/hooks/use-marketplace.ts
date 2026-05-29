import { useQuery } from '@tanstack/react-query';

import { marketplaceBackend, productsBackend, type RankedProduct } from '@/src/api/backend';

export function useMarketplaceHome(params: { category?: string } = {}) {
  return useQuery({
    queryKey: ['marketplace', 'home', params.category ?? 'all'],
    queryFn: () => marketplaceBackend.home({ category: params.category, limit: 50 }),
    staleTime: 30_000,
  });
}

export function useNearby(params: {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  category?: string;
  sortBy?: 'relevance' | 'distance';
}) {
  return useQuery({
    queryKey: [
      'marketplace',
      'nearby',
      params.lat,
      params.lng,
      params.radiusKm,
      params.category ?? 'all',
      params.sortBy ?? 'relevance',
    ],
    enabled: params.lat !== null && params.lng !== null,
    queryFn: () =>
      marketplaceBackend.nearby({
        lat: params.lat!,
        lng: params.lng!,
        radiusKm: params.radiusKm,
        category: params.category,
        sortBy: params.sortBy,
        limit: 50,
      }),
    staleTime: 15_000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    enabled: !!id,
    queryFn: () => productsBackend.byId(id!) as Promise<RankedProduct>,
    staleTime: 60_000,
  });
}
