import { create } from 'zustand';

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
    set({ loading: true });
    // Mock latency
    await new Promise((r) => setTimeout(r, 500));
    if (!email || !password || password.length < 8) {
      set({ loading: false });
      return { ok: false, reason: 'Email and 8+ character password required.' };
    }
    set({
      loading: false,
      accessToken: 'mock-access-' + Date.now(),
      refreshToken: 'mock-refresh-' + Date.now(),
      user: {
        id: `u-${Date.now().toString().slice(-6)}`,
        handle: email.split('@')[0],
        name: email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role,
        kycVerified: false,
        createdAt: new Date().toISOString(),
      },
    });
    return { ok: true };
  },

  signOut: () => set({ accessToken: null, refreshToken: null, user: null }),

  refresh: async () => {
    if (!get().refreshToken) return;
    await new Promise((r) => setTimeout(r, 250));
    set({ accessToken: 'mock-access-' + Date.now() });
  },
}));

export const useIsAuthed = () => useAuth((s) => !!s.accessToken);
