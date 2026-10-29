import { http } from '@/src/lib/http';

import type {
  NearbyVendorsQuery,
  NearbyVendorsResponse,
  RankedProduct,
  Review,
  StoreSetupRequest,
  StoreSetupResponse,
  VendorProfile,
  Post,
} from '../types';

export const vendorsApi = {
  setupStore(input: StoreSetupRequest) {
    return http.post<StoreSetupResponse>('/vendors/store-setup', input);
  },

  nearby(query: NearbyVendorsQuery) {
    return http.get<NearbyVendorsResponse>('/vendors/nearby', { query });
  },

  byHandle(handle: string) {
    return http.get<VendorProfile>(`/vendors/${handle}`);
  },

  products(handle: string) {
    return http.get<RankedProduct[]>(`/vendors/${handle}/products`);
  },

  reviews(handle: string) {
    return http.get<Review[]>(`/vendors/${handle}/reviews`);
  },

  follow(handle: string) {
    return http.post<{ following: boolean }>(`/vendors/${handle}/follow`);
  },

  block(handle: string) {
    return http.post<{ blocked: boolean }>(`/vendors/${handle}/block`);
  },

  posts(handle: string) {
    return http.get<{ items: Post[]; nextCursor: string | null }>(`/users/${handle}/posts`);
  },

  updateLocationSettings(input: { showOnMap?: boolean; showExactLocation?: boolean }) {
    return http.patch<{ success: boolean; showOnMap: boolean; showExactLocation: boolean }>(
      '/vendors/location-settings',
      input,
    );
  },
};
