import { useMutation, useQuery } from '@tanstack/react-query';

import { bookingsApi } from '..';
import { queryKeys } from '../../query-keys';

import type { BookServiceRequest, Id } from '../../types';

export function useBookService() {
  return useMutation({
    mutationFn: ({ productId, input }: { productId: Id; input: BookServiceRequest }) =>
      bookingsApi.bookService(productId, input),
  });
}

export function useBookingTrack(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.bookings.track(id),
    enabled: !!id,
    queryFn: () => bookingsApi.track(id!),
    refetchInterval: 5000,
  });
}
