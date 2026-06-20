import { create } from 'zustand';

import { accountApi } from '@/src/api/account';
import { authBackend } from '@/src/api/backend';
import { authSessionStorage } from '@/src/lib/auth-session-storage';
import { setAuthTokenProvider } from '@/src/lib/auth-token-provider';

import { useUser } from './user';

import type { AuthUserPayload } from '@/src/api/types';

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
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  bootstrapping: boolean;
  hydrated: boolean;
  bootstrap: () => Promise<void>;
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
  signOut: () => Promise<void>;
  /** Refresh expired access token. */
  refresh: () => Promise<string | null>;
};

const AUTH_SESSION_VERSION = 1;

type StoredAuthSession = {
  version: typeof AUTH_SESSION_VERSION;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayloadWithAliases;
};

type AuthUserPayloadWithAliases = AuthUserPayload & {
  handle?: string;
  name?: string;
};

export function isInvalidSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) return false;

  const status = Number((error as { status?: unknown }).status);
  return status === 401 || status === 403;
}

function toAuthUser(user: AuthUserPayloadWithAliases, fallbackRole: AuthUser['role']): AuthUser {
  const role = user.role === 'buyer' || user.role === 'vendor' ? user.role : fallbackRole;
  const handle = user.username || user.handle || user.email.split('@')[0] || 'user';
  const name = user.displayName || user.name || handle;

  return {
    id: user.id,
    handle,
    name,
    email: user.email,
    role,
    kycVerified: !!user.kycVerified,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };
}

function createSession(result: AuthResponse, fallbackRole: AuthUser['role']): StoredAuthSession {
  return {
    version: AUTH_SESSION_VERSION,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: toAuthUser(result.user, fallbackRole),
  };
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;

  const user = value as Partial<AuthUser>;
  return (
    typeof user.id === 'string' &&
    typeof user.handle === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'buyer' || user.role === 'vendor') &&
    typeof user.kycVerified === 'boolean' &&
    typeof user.createdAt === 'string'
  );
}

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== 'object') return false;

  const session = value as Partial<StoredAuthSession>;
  return (
    session.version === AUTH_SESSION_VERSION &&
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    typeof session.refreshToken === 'string' &&
    session.refreshToken.length > 0 &&
    isAuthUser(session.user)
  );
}

async function readStoredAuthSession(): Promise<StoredAuthSession | null> {
  let raw: string | null;
  try {
    raw = await authSessionStorage.get();
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    await clearStoredAuthSession();
    return null;
  }

  if (isStoredAuthSession(parsed)) return parsed;

  await clearStoredAuthSession();
  return null;
}

async function persistAuthSession(session: StoredAuthSession): Promise<void> {
  await authSessionStorage.set(JSON.stringify(session));
}

async function clearStoredAuthSession(): Promise<void> {
  try {
    await authSessionStorage.remove();
  } catch {
    // In-memory auth state should still clear even if the storage backend fails.
  }
}

async function validateStoredSession(fallbackRole: AuthUser['role']): Promise<AuthUser | null> {
  try {
    const me = await accountApi.me();
    return toAuthUser(me, fallbackRole);
  } catch (error) {
    if (isInvalidSessionError(error)) {
      await clearStoredAuthSession();
      useAuth.setState({ accessToken: null, refreshToken: null, user: null });
      syncRole(null);
    }

    return null;
  }
}

function syncRole(user: AuthUser | null): void {
  useUser.getState().setRole(user?.role ?? 'buyer');
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  loading: false,
  bootstrapping: false,
  hydrated: false,

  bootstrap: async () => {
    if (get().hydrated || get().bootstrapping) return;

    set({ bootstrapping: true, loading: true });

    try {
      const storedSession = await readStoredAuthSession();

      if (!storedSession) {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          loading: false,
          bootstrapping: false,
          hydrated: true,
        });
        syncRole(null);
        return;
      }

      set({
        accessToken: storedSession.accessToken,
        refreshToken: storedSession.refreshToken,
        user: storedSession.user,
      });
      syncRole(storedSession.user);

      const validatedUser = await validateStoredSession(storedSession.user.role);
      if (validatedUser) {
        const { accessToken, refreshToken } = get();
        const session: StoredAuthSession = {
          version: AUTH_SESSION_VERSION,
          accessToken: accessToken ?? storedSession.accessToken,
          refreshToken: refreshToken ?? storedSession.refreshToken,
          user: validatedUser,
        };
        await persistAuthSession(session);
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
        });
        syncRole(session.user);
      }
    } catch (error) {
      if (isInvalidSessionError(error)) {
        await clearStoredAuthSession();
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
        syncRole(null);
      }
    } finally {
      set({ loading: false, bootstrapping: false, hydrated: true });
    }
  },

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
      const session = createSession(result, role);
      await persistAuthSession(session);
      set({
        loading: false,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
        hydrated: true,
      });
      syncRole(session.user);
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
      const session = createSession(result, role);
      await persistAuthSession(session);
      set({
        loading: false,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
        hydrated: true,
      });
      syncRole(session.user);
      return { ok: true };
    } catch (error) {
      set({ loading: false });
      const reason = error instanceof Error ? error.message : 'Sign-in failed.';
      return { ok: false, reason };
    }
  },

  signOut: async () => {
    const logout = authBackend.logout().catch(() => undefined);
    await clearStoredAuthSession();
    set({ accessToken: null, refreshToken: null, user: null, hydrated: true });
    syncRole(null);
    await logout;
  },

  refresh: async () => {
    const { refreshToken, user } = get();
    if (!refreshToken || !user) return null;

    try {
      const tokens = await authBackend.refresh(refreshToken);
      const session: StoredAuthSession = {
        version: AUTH_SESSION_VERSION,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
      await persistAuthSession(session);
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user });
      return tokens.accessToken;
    } catch (error) {
      if (isInvalidSessionError(error)) {
        await clearStoredAuthSession();
        set({ accessToken: null, refreshToken: null, user: null });
        syncRole(null);
      }
      return null;
    }
  },
}));

setAuthTokenProvider({
  getSnapshot: () => {
    const { accessToken, refreshToken } = useAuth.getState();
    return { accessToken, refreshToken };
  },
  refresh: () => useAuth.getState().refresh(),
});

export const useIsAuthed = () => useAuth((s) => !!s.accessToken && !!s.user);
