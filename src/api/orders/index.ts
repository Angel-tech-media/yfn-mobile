import { http } from '@/src/lib/http';

import { createIdempotencyKey } from '../idempotency';

import type {
  ConfirmOrderResponse,
  CreateDisputeRequest,
  CreateDisputeResponse,
  CreateOrderRequest,
  CreateReviewRequest,
  Id,
  Order,
  OrderDetailResponse,
  OrdersQuery,
  Review,
  SetOrderStatusRequest,
  TrackOrderResponse,
} from '../types';

type MutationOptions = {
  idempotencyKey?: string;
};

export const ordersApi = {
  list(query: OrdersQuery = {}) {
    return http.get<Order[]>('/orders', { query });
  },

  create(input: CreateOrderRequest, options: MutationOptions = {}) {
    return http.post<Order>('/orders', input, {
      idempotencyKey: options.idempotencyKey ?? createIdempotencyKey('orders-create'),
    });
  },

  byId(id: Id) {
    return http.get<OrderDetailResponse>(`/orders/${id}`);
  },

  setStatus(id: Id, input: SetOrderStatusRequest) {
    return http.patch<Order>(`/orders/${id}/status`, input);
  },

  confirm(id: Id) {
    return http.post<ConfirmOrderResponse>(`/orders/${id}/confirm`, undefined, {
      idempotencyKey: createIdempotencyKey('orders-confirm'),
    });
  },

  dispute(id: Id, input: CreateDisputeRequest) {
    return http.post<CreateDisputeResponse>(`/orders/${id}/dispute`, input);
  },

  review(id: Id, input: CreateReviewRequest) {
    return http.post<Review>(`/orders/${id}/review`, input);
  },

  track(id: Id) {
    return http.get<TrackOrderResponse>(`/orders/${id}/track`);
  },
};
