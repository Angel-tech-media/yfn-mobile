import { Stack } from 'expo-router';

export default function AppLaunchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ animation: 'fade' }} />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="intent" />
    </Stack>
  );
}
