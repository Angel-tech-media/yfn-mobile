/**
 * Mock API layer — mirrors the real backend shape so the rest of the app
 * doesn't change when we wire Supabase / NestJS later. Every function returns
 * a Promise and pretends to take ~200ms. Swap each implementation for `fetch`
 * one at a time without touching screens.
 *
 * See `API.md` at repo root for the endpoint contract.
 */

import { useAuth } from '@/src/store/auth';
import { useEngagement, type Repost } from '@/src/store/engagement';
import { useOrders, type Order, type OrderStatus } from '@/src/store/orders';
import { useUser } from '@/src/store/user';
import { useWallet } from '@/src/store/wallet';

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

// ──────────────────────────── Auth ────────────────────────────

export const authApi = {
  /** POST /v1/auth/login */
  async login(email: string, password: string, role: 'buyer' | 'vendor'): Promise<Result<{ token: string }>> {
    const result = await useAuth.getState().signIn({ email, password, role });
    useUser.getState().setRole(role);
    if (!result.ok) return { ok: false, error: result.reason };
    const token = useAuth.getState().accessToken;
    if (!token) return { ok: false, error: 'No token issued' };
    return { ok: true, data: { token } };
  },

  /** POST /v1/auth/logout */
  async logout(): Promise<Result<null>> {
    await delay(120);
    useAuth.getState().signOut();
    return { ok: true, data: null };
  },

  /** POST /v1/auth/kyc/nin — submits NIN for verification */
  async submitKyc(nin: string): Promise<Result<{ verified: boolean }>> {
    await delay(800);
    if (!/^\d{11}$/.test(nin)) return { ok: false, error: 'NIN must be 11 digits' };
    return { ok: true, data: { verified: true } };
  },
};

// ──────────────────────────── Wallet ────────────────────────────

export const walletApi = {
  /** GET /v1/wallet */
  async get() {
    await delay();
    const s = useWallet.getState();
    return {
      ok: true as const,
      data: {
        balance: s.balance,
        inEscrow: s.inEscrow,
        accountNumber: s.accountNumber,
        bankName: s.bankName,
        recent: s.recent,
      },
    };
  },

  /** POST /v1/wallet/topup */
  async topUp(amount: number, source = 'Paystack'): Promise<Result<{ newBalance: number }>> {
    await delay();
    useWallet.getState().topUp(amount, source);
    return { ok: true, data: { newBalance: useWallet.getState().balance } };
  },

  /** POST /v1/wallet/pay — debits buyer, parks funds in escrow */
  async pay(input: { amount: number; orderId: string; vendor: string }): Promise<
    Result<{ orderId: string }>
  > {
    await delay();
    const result = useWallet.getState().payFromWallet(input);
    if (!result.ok) return { ok: false, error: 'Insufficient balance' };
    return { ok: true, data: { orderId: input.orderId } };
  },

  /** POST /v1/wallet/release/:orderId — buyer confirms delivery */
  async release(input: { amount: number; orderId: string; vendor: string }): Promise<Result<null>> {
    await delay();
    useWallet.getState().releaseFromEscrow(input);
    return { ok: true, data: null };
  },
};

// ──────────────────────────── Orders ────────────────────────────

export const ordersApi = {
  /** GET /v1/orders */
  async list(): Promise<Result<Order[]>> {
    await delay();
    return { ok: true, data: useOrders.getState().orders };
  },

  /** POST /v1/orders */
  async create(input: Omit<Order, 'placedAt' | 'status'>): Promise<Result<Order>> {
    await delay();
    useOrders.getState().add(input);
    const order = useOrders.getState().orders[0];
    return { ok: true, data: order };
  },

  /** PATCH /v1/orders/:id/status */
  async setStatus(id: string, status: OrderStatus): Promise<Result<null>> {
    await delay();
    useOrders.getState().setStatus(id, status);
    return { ok: true, data: null };
  },
};

// ──────────────────────────── Reposts (referrals) ────────────────────────────

export const repostApi = {
  /** GET /v1/reposts/me */
  async list(): Promise<Result<Repost[]>> {
    await delay();
    return { ok: true, data: Object.values(useEngagement.getState().reposts) };
  },

  /** POST /v1/reposts */
  async toggle(input: {
    productId: string;
    vendorId: string;
    caption?: string;
    visibility?: Repost['visibility'];
  }): Promise<Result<null>> {
    await delay();
    useEngagement.getState().toggleRepost(input);
    return { ok: true, data: null };
  },
};

// ──────────────────────────── Vendors / Places ────────────────────────────

export const vendorsApi = {
  /** GET /v1/vendors/nearby?lat=&lng=&radiusKm= */
  async nearby(_lat: number, _lng: number, _radiusKm = 5): Promise<
    Result<Array<{ id: string; name: string; category: string; distanceKm: number; rating: number }>>
  > {
    await delay();
    return {
      ok: true,
      data: [
        { id: 'p1', name: 'Aisha Threads', category: 'Tailor', distanceKm: 0.4, rating: 4.9 },
        { id: 'p2', name: 'GadgetFix Hub', category: 'Phone repair', distanceKm: 0.9, rating: 4.7 },
        { id: 'p3', name: 'Zara Cakes', category: 'Bakery', distanceKm: 1.2, rating: 4.8 },
      ],
    };
  },

  /** GET /v1/vendors/:handle */
  async byHandle(handle: string) {
    await delay();
    return { ok: true as const, data: { handle, found: true } };
  },
};
