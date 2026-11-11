import { Stack } from 'expo-router';

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="two-factor" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="forgot-otp" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
