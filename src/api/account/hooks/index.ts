import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountApi } from '..';
import { queryKeys } from '../../query-keys';

import type {
  CreateAddressRequest,
  CreatePaymentMethodRequest,
  Id,
  UpdateAddressRequest,
  UpdateMeRequest,
} from '../../types';

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.account.me,
    queryFn: accountApi.me,
    staleTime: 30_000,
  });

export const useAddresses = () =>
  useQuery({
    queryKey: queryKeys.account.addresses,
    queryFn: accountApi.addresses,
    staleTime: 30_000,
  });

export const usePaymentMethods = () =>
  useQuery({
    queryKey: queryKeys.account.paymentMethods,
    queryFn: accountApi.paymentMethods,
    staleTime: 30_000,
  });

export const useDataExport = () =>
  useQuery({
    queryKey: queryKeys.account.dataExport,
    queryFn: accountApi.dataExport,
    enabled: false,
  });

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeRequest) => accountApi.updateMe(input),
    onSuccess: (me) => qc.setQueryData(queryKeys.account.me, me),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressRequest) => accountApi.createAddress(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.account.addresses }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: Id; input: UpdateAddressRequest }) =>
      accountApi.updateAddress(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.account.addresses }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountApi.deleteAddress,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.account.addresses }),
  });
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentMethodRequest) => accountApi.createPaymentMethod(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.account.paymentMethods }),
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountApi.deletePaymentMethod,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.account.paymentMethods }),
  });
}

export const useDeleteMe = () => useMutation({ mutationFn: accountApi.deleteMe });
