import { http } from '@/src/lib/http';

import type { BookServiceRequest, BookServiceResponse, BookingTrackResponse, Id } from '../types';

export const bookingsApi = {
  bookService(productId: Id, input: BookServiceRequest) {
    return http.post<BookServiceResponse>(`/services/${productId}/book`, input);
  },

  track(id: Id) {
    return http.get<BookingTrackResponse>(`/bookings/${id}/track`);
  },
};
