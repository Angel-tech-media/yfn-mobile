import { http } from '@/src/lib/http';

import { createIdempotencyKey } from '../idempotency';

import type {
  Id,
  ReferralWalletResponse,
  RefundEscrowRequest,
  RefundEscrowResponse,
  ReleaseEscrowRequest,
  ReleaseEscrowResponse,
  TopUpRequest,
  TopUpResponse,
  WalletPayRequest,
  WalletPayResponse,
  WalletResponse,
  WithdrawRequest,
  WithdrawResponse,
} from '../types';

type MutationOptions = {
  idempotencyKey?: string;
};

export const walletApi = {
  get() {
    return http.get<WalletResponse>('/wallet');
  },

  topUp(input: TopUpRequest, options: MutationOptions = {}) {
    return http.post<TopUpResponse>('/wallet/topup', input, {
      idempotencyKey: options.idempotencyKey ?? createIdempotencyKey('wallet-topup'),
    });
  },

  pay(input: WalletPayRequest, options: MutationOptions = {}) {
    return http.post<WalletPayResponse>('/wallet/pay', input, {
      idempotencyKey: options.idempotencyKey ?? createIdempotencyKey('wallet-pay'),
    });
  },

  release(orderId: Id, input: ReleaseEscrowRequest, options: MutationOptions = {}) {
    return http.post<ReleaseEscrowResponse>(`/wallet/release/${orderId}`, input, {
      idempotencyKey: options.idempotencyKey ?? createIdempotencyKey('wallet-release'),
    });
  },

  refund(orderId: Id, input: RefundEscrowRequest, options: MutationOptions = {}) {
    return http.post<RefundEscrowResponse>(`/wallet/refund/${orderId}`, input, {
      idempotencyKey: options.idempotencyKey ?? createIdempotencyKey('wallet-refund'),
    });
  },

  withdraw(input: WithdrawRequest, options: MutationOptions = {}) {
    return http.post<WithdrawResponse>('/wallet/withdraw', input, {
      idempotencyKey: options.idempotencyKey ?? createIdempotencyKey('wallet-withdraw'),
    });
  },

  referrals() {
    return http.get<ReferralWalletResponse>('/wallet/referrals');
  },
};
