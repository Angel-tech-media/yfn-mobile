import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ordersApi } from '..';
import { queryKeys } from '../../query-keys';

import type {
  CreateDisputeRequest,
  CreateOrderRequest,
  CreateReviewRequest,
  Id,
  OrdersQuery,
  SetOrderStatusRequest,
} from '../../types';

export function useOrders(params: OrdersQuery = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.list(params),
    staleTime: 15_000,
  });
}

export function useOrder(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    enabled: !!id,
    queryFn: () => ordersApi.byId(id!),
    staleTime: 15_000,
  });
}

export function useOrderTrack(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.track(id),
    enabled: !!id,
    queryFn: () => ordersApi.track(id!),
    refetchInterval: 15_000,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderRequest) => ordersApi.create(input),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.orders.detail(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.wallet.me });
    },
  });
}

export function useSetOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: SetOrderStatusRequest }) =>
      ordersApi.setStatus(id, input),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.orders.detail(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.confirm,
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.orders.detail(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.wallet.me });
    },
  });
}

export function useDisputeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: CreateDisputeRequest }) =>
      ordersApi.dispute(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useReviewOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: CreateReviewRequest }) =>
      ordersApi.review(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
    },
  });
}
