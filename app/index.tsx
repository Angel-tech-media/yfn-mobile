import { Redirect } from 'expo-router';

import { useAuth, useIsAuthed } from '@/src/store/auth';

export default function Index() {
  const hydrated = useAuth((s) => s.hydrated);
  const authed = useIsAuthed();

  if (!hydrated) return null;

  return <Redirect href={(authed ? '/(home-feed)/(tabs)' : '/welcome') as never} />;
}
