import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { router } from 'expo-router';

import { useAuth, useIsAuthed } from '@/src/store/auth';

/**
 * Redirects to /login if the user isn't signed in. Drop this around the root
 * of any protected route group.
 */
export function RequireAuth({ children }: PropsWithChildren) {
  const authed = useIsAuthed();
  const bootstrapping = useAuth((s) => s.bootstrapping);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !bootstrapping && !authed) {
      router.replace('/login' as never);
    }
  }, [authed, bootstrapping, hydrated]);

  if (!hydrated || bootstrapping || !authed) return null;
  return <>{children}</>;
}
