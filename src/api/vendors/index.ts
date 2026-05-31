import { http } from '@/src/lib/http';

import type {
  NearbyVendorsQuery,
  NearbyVendorsResponse,
  RankedProduct,
  Review,
  StoreSetupRequest,
  StoreSetupResponse,
  VendorProfile,
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
};
