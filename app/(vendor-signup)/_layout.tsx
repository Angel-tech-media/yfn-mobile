import { Stack } from 'expo-router';

export default function VendorSignupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="vendor-ready" />
    </Stack>
  );
}
