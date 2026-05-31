import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { walletApi } from '..';
import { queryKeys } from '../../query-keys';

import type {
  Id,
  RefundEscrowRequest,
  ReleaseEscrowRequest,
  TopUpRequest,
  WalletPayRequest,
  WithdrawRequest,
} from '../../types';

export const useWallet = () =>
  useQuery({
    queryKey: queryKeys.wallet.me,
    queryFn: walletApi.get,
    staleTime: 15_000,
  });

export const useWalletReferrals = () =>
  useQuery({
    queryKey: queryKeys.wallet.referrals,
    queryFn: walletApi.referrals,
    staleTime: 30_000,
  });

export function useTopUpWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TopUpRequest) => walletApi.topUp(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wallet.me }),
  });
}

export function usePayFromWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WalletPayRequest) => walletApi.pay(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallet.me });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useReleaseEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: Id; input: ReleaseEscrowRequest }) =>
      walletApi.release(orderId, input),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallet.me });
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
  });
}

export function useRefundEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: Id; input: RefundEscrowRequest }) =>
      walletApi.refund(orderId, input),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.wallet.me });
      qc.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
    },
  });
}

export function useWithdrawWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WithdrawRequest) => walletApi.withdraw(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wallet.me }),
  });
}
