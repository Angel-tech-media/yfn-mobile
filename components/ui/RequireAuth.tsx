import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { router } from 'expo-router';

import { useIsAuthed } from '@/src/store/auth';

/**
 * Redirects to /login if the user isn't signed in. Drop this around the root
 * of any protected route group.
 */
export function RequireAuth({ children }: PropsWithChildren) {
  const authed = useIsAuthed();
  useEffect(() => {
    if (!authed) {
      router.replace('/login' as never);
    }
  }, [authed]);
  if (!authed) return null;
  return <>{children}</>;
}
