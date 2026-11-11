import { View } from 'react-native';
import { Stack } from 'expo-router';

import { PlasmaBackground } from '@/components/ui/PlasmaBackground';
import { RequireAuth } from '@/components/ui/RequireAuth';
import { useEffectiveMode } from '@/src/store/theme';
import { plasma } from '@/src/theme/plasma';

export default function HomeFeedLayout() {
  const mode = useEffectiveMode();
  const baseBg = mode === 'dark' ? plasma.baseDark : plasma.baseLight;

  return (
    <RequireAuth>
      <View style={{ flex: 1, backgroundColor: baseBg }}>
        <PlasmaBackground />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="order-confirmed" options={{ animation: 'fade' }} />
          <Stack.Screen name="wishlist" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="search" />
          <Stack.Screen name="help" />
          <Stack.Screen name="reels" />
          <Stack.Screen name="reel" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="orders/index" />
          <Stack.Screen name="orders/[id]" />
          <Stack.Screen name="orders/[id]/track" />
          <Stack.Screen name="orders/[id]/review" />
          <Stack.Screen name="messages/[id]" />
          <Stack.Screen name="post/[id]/comments" options={{ presentation: 'modal' }} />
          <Stack.Screen name="u/[handle]" />
          <Stack.Screen name="place/[id]" />
          <Stack.Screen name="wallet/referrals" />
          <Stack.Screen name="story/[id]" options={{ animation: 'fade' }} />
          <Stack.Screen name="account/edit" />
          <Stack.Screen name="account/addresses" />
          <Stack.Screen name="account/addresses/add" />
          <Stack.Screen name="account/payment-methods" />
          <Stack.Screen name="account/payment-methods/add" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="settings/privacy" />
          <Stack.Screen name="settings/terms" />
          <Stack.Screen name="settings/privacy-policy" />
          <Stack.Screen name="create/post" options={{ presentation: 'modal' }} />
          <Stack.Screen name="create/story" options={{ presentation: 'fullScreenModal' as never }} />
          <Stack.Screen name="create/reel" options={{ presentation: 'fullScreenModal' as never }} />
        </Stack>
      </View>
    </RequireAuth>
  );
}
