import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productsApi } from '..';
import { queryKeys } from '../../query-keys';

import type { Id } from '../../types';

export function useProduct(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    enabled: !!id,
    queryFn: () => productsApi.byId(id!),
    staleTime: 60_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: (product) => {
      qc.setQueryData(queryKeys.products.detail(product.id), product);
      qc.invalidateQueries({ queryKey: ['marketplace'] });
      qc.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: Parameters<typeof productsApi.update>[1] }) =>
      productsApi.update(id, input),
    onSuccess: (product) => {
      qc.setQueryData(queryKeys.products.detail(product.id), product);
      qc.invalidateQueries({ queryKey: ['marketplace'] });
      qc.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['marketplace'] });
      qc.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
