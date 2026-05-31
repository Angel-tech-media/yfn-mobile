/**
 * Public API barrel. New code should prefer resource imports, e.g.
 * `@/src/api/orders` and `@/src/api/orders/hooks`.
 *
 * The `authApi` export keeps the existing screen-level login/logout calls
 * working while delegating to the real backend-backed auth store.
 */

import { useAuth } from '@/src/store/auth';

import { authApi as authRoutes } from './auth';

export * from './types';
export { accountApi } from './account';
export { authRoutes };
export { bookingsApi } from './bookings';
export { chatApi } from './chat';
export { feedApi } from './feed';
export { hiveApi } from './hive';
export { marketplaceApi } from './marketplace';
export { newsApi } from './news';
export { notificationsApi } from './notifications';
export { ordersApi } from './orders';
export { productsApi } from './products';
export { repostsApi } from './reposts';
export { searchApi } from './search';
export { systemApi } from './system';
export { uploadsApi } from './uploads';
export { vendorsApi } from './vendors';

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

type RegisterCompatInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'buyer' | 'vendor';
  dob?: string;
  gender?: 'female' | 'male' | 'non-binary' | 'prefer-not';
};

export const authApi = {
  async register(input: RegisterCompatInput): Promise<Result<{ token: string }>> {
    const result = await useAuth.getState().signUp(input);
    if (!result.ok) return { ok: false, error: result.reason };
    const token = useAuth.getState().accessToken;
    if (!token) return { ok: false, error: 'No token issued' };
    return { ok: true, data: { token } };
  },

  async login(email: string, password: string, role: 'buyer' | 'vendor'): Promise<Result<{ token: string }>> {
    const result = await useAuth.getState().signIn({ email, password, role });
    if (!result.ok) return { ok: false, error: result.reason };
    const token = useAuth.getState().accessToken;
    if (!token) return { ok: false, error: 'No token issued' };
    return { ok: true, data: { token } };
  },

  async logout(): Promise<Result<null>> {
    useAuth.getState().signOut();
    return { ok: true, data: null };
  },

  async submitKyc(nin: string): Promise<Result<{ verified: boolean }>> {
    try {
      const data = await authRoutes.submitNin({ nin });
      return { ok: true, data: { verified: data.verified } };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'KYC submission failed.',
      };
    }
  },
};
