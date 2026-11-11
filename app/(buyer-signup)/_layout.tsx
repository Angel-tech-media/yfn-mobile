import { Stack } from 'expo-router';

export default function BuyerSignupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="onboarding-complete" options={{ animation: 'fade' }} />
    </Stack>
  );
}
