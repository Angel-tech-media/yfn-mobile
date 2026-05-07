import { Stack } from 'expo-router';

export default function VendorDashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="vendor-dashboard" />
      <Stack.Screen name="vendor-store" />
      <Stack.Screen name="vendor-dashboard/products" />
      <Stack.Screen name="vendor-dashboard/withdraw" />
      <Stack.Screen name="vendor-dashboard/withdraw-confirmed" options={{ animation: 'fade' }} />
      <Stack.Screen name="vendor-dashboard/sales" />
      <Stack.Screen name="products/add" />
      <Stack.Screen name="products/saved" options={{ animation: 'fade' }} />
      <Stack.Screen name="products/[id]" />
    </Stack>
  );
}
