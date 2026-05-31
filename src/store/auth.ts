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
  /** Access token; in production persist with expo-secure-store. */
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  signUp: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'buyer' | 'vendor';
    dob?: string;
    gender?: 'female' | 'male' | 'non-binary' | 'prefer-not';
  }) => Promise<{ ok: true } | { ok: false; reason: string }>;
  signIn: (input: {
    email: string;
    password: string;
    role: 'buyer' | 'vendor';
  }) => Promise<{ ok: true } | { ok: false; reason: string }>;
  signOut: () => void;
  /** Refresh expired access token. */
  refresh: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  loading: false,

  signUp: async ({ name, email, phone, password, role, dob, gender }) => {
    if (!name || !email || !password || password.length < 8) {
      return { ok: false, reason: 'Name, email, and 8+ character password required.' };
    }
    set({ loading: true });
    try {
      const username = email.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || email;
      const result = await authBackend.register({
        username,
        email,
        password,
        role,
        displayName: name,
        phone,
        dob,
        gender,
      });
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
          kycVerified: !!result.user.kycVerified,
          createdAt: result.user.createdAt ?? new Date().toISOString(),
        },
      });
      return { ok: true };
    } catch (error) {
      set({ loading: false });
      return { ok: false, reason: error instanceof Error ? error.message : 'Signup failed.' };
    }
  },

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
          kycVerified: !!result.user.kycVerified,
          createdAt: result.user.createdAt ?? new Date().toISOString(),
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
