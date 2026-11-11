import { Stack } from 'expo-router';

export default function VendorSignupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="vendor-ready" />
    </Stack>
  );
}
