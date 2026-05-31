import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { vendorsApi } from '..';
import { queryKeys } from '../../query-keys';

import type { NearbyVendorsQuery } from '../../types';

export function useNearbyVendors(
  params: Omit<NearbyVendorsQuery, 'lat' | 'lng'> & {
    lat: number | null;
    lng: number | null;
  },
) {
  return useQuery({
    queryKey: queryKeys.vendors.nearby(params),
    enabled: params.lat !== null && params.lng !== null,
    queryFn: () => vendorsApi.nearby({ ...params, lat: params.lat!, lng: params.lng! }),
    staleTime: 30_000,
  });
}

export function useVendor(handle: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(handle),
    enabled: !!handle,
    queryFn: () => vendorsApi.byHandle(handle!),
    staleTime: 60_000,
  });
}

export function useVendorProducts(handle: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.products(handle),
    enabled: !!handle,
    queryFn: () => vendorsApi.products(handle!),
    staleTime: 60_000,
  });
}

export function useVendorReviews(handle: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vendors.reviews(handle),
    enabled: !!handle,
    queryFn: () => vendorsApi.reviews(handle!),
    staleTime: 60_000,
  });
}

export function useSetupStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vendorsApi.setupStore,
    onSuccess: ({ vendor }) => {
      qc.setQueryData(queryKeys.vendors.detail(vendor.handle), vendor);
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useFollowVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vendorsApi.follow,
    onSuccess: (_, handle) => {
      qc.invalidateQueries({ queryKey: queryKeys.vendors.detail(handle) });
    },
  });
}
