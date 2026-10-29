import { Redirect } from 'expo-router';

/** Keep the old path while routing to the single canonical inbox screen. */
export default function ThreadsIndexAlias() {
  return <Redirect href="/inbox" />;
}
