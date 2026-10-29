import { initMobileSentry, wrapWithSentry } from '@/src/services/sentry';

initMobileSentry();
import { useEffect, useState } from 'react';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { VibeAiCopilot } from '@/components/ai/VibeAiCopilot';
import { useGlobalChatNotifications } from '@/src/hooks/use-global-chat';
import { usePushNotifications } from '@/src/hooks/use-push-notifications';
import { QueryProvider } from '@/src/providers/query-provider';
import { ToastProvider } from '@/src/providers/toast-provider';
import { useAuth } from '@/src/store/auth';
import { useEffectiveMode } from '@/src/store/theme';
import { appFonts } from '@/src/theme/fonts';

// Splash auto-hide enabled for immediate rendering

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Root navigator. Each top-level entry corresponds 1:1 to a Figma section
 * (or a utility route). Per-section options live in the section's own
 * `_layout.tsx`. See `app/architecture.md` for the full Figma → code map.
 */
function PushNotificationListener() {
  usePushNotifications();
  return null;
}

function GlobalChatListener() {
  useGlobalChatNotifications();
  return null;
}

function RootLayout() {
  const effectiveMode = useEffectiveMode();
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const bootstrapAuth = useAuth((s) => s.bootstrap);
  const authHydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setForceReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const isReady = (fontsLoaded || fontError || forceReady) && (authHydrated || forceReady);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  // Immediate render - fallback fonts and default auth state mount immediately
  SplashScreen.hideAsync().catch(() => undefined);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ToastProvider>
          <GlobalChatListener />
          <PushNotificationListener />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />

            {/* Figma sections — each is a route group */}
            <Stack.Screen name="(app-launch)" />
            <Stack.Screen name="(login)" />
            <Stack.Screen name="(buyer-signup)" />
            <Stack.Screen name="(vendor-signup)" />
            <Stack.Screen name="(vendor-dashboard)" />
            <Stack.Screen name="(home-feed)" />

            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <VibeAiCopilot />
          <StatusBar style={effectiveMode === 'dark' ? 'light' : 'dark'} />
        </ToastProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

export default wrapWithSentry(RootLayout);
