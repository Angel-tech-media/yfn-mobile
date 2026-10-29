import { Redirect, useLocalSearchParams } from 'expo-router';

/** Legacy route alias; all conversations now use the realtime thread screen. */
export default function MessageRouteAlias() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const href = id ? `/threads/${id}` : '/threads';

  return <Redirect href={href as never} />;
}
