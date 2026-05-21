import { create } from 'zustand';

import { authBackend } from '@/src/api/backend';

export type AuthUser = {
  id: string;
  handle: string;
  name: string;
  email: string;
  role: 'buyer' | 'vendor';
  kycVerified: boolean;
  /** ISO string when the user signed up */
  createdAt: string;
};

type AuthState = {
  /** Access token; in production move to expo-secure-store. */
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  /** Sign-in flow — mocked locally for now. */
  signIn: (input: {
    email: string;
    password: string;
    role: 'buyer' | 'vendor';
  }) => Promise<{ ok: true } | { ok: false; reason: string }>;
  signOut: () => void;
  /** Refresh expired access token (no-op in mock). */
  refresh: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  // Demo defaults — keeps RequireAuth happy so you can test deep-links
  // without going through login every reload. Real auth wipes this on logout.
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
  user: {
    id: 'u-demo',
    handle: 'davidokpo',
    name: 'David Okpo',
    email: 'davidokpo@gmail.com',
    role: 'buyer',
    kycVerified: true,
    createdAt: new Date('2026-01-01').toISOString(),
  },
  loading: false,

  signIn: async ({ email, password, role }) => {
    if (!email || !password || password.length < 8) {
      return { ok: false, reason: 'Email and 8+ character password required.' };
    }
    set({ loading: true });
    try {
      const result = await authBackend.login({ email, password });
      set({
        loading: false,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          handle: result.user.username,
          name: result.user.displayName,
          email: result.user.email,
          role: result.user.role === 'admin' ? role : (result.user.role as 'buyer' | 'vendor'),
          kycVerified: false,
          createdAt: new Date().toISOString(),
        },
      });
      return { ok: true };
    } catch (error) {
      set({ loading: false });
      const reason = error instanceof Error ? error.message : 'Sign-in failed.';
      return { ok: false, reason };
    }
  },

  signOut: () => {
    void authBackend.logout().catch(() => undefined);
    set({ accessToken: null, refreshToken: null, user: null });
  },

  refresh: async () => {
    const current = get().refreshToken;
    if (!current) return;
    try {
      const tokens = await authBackend.refresh(current);
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch {
      set({ accessToken: null, refreshToken: null, user: null });
    }
  },
}));

export const useIsAuthed = () => useAuth((s) => !!s.accessToken);
