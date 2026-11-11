import '@/src/polyfills/dom-exception';
import { initMobileSentry, wrapWithSentry } from '@/src/services/sentry';

initMobileSentry();
import { useEffect, useState } from 'react';

import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  DarkTheme as RouterDarkTheme,
  DefaultTheme as RouterDefaultTheme,
  Stack,
  ThemeProvider as RouterThemeProvider,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { VibeAiCopilot } from '@/components/ai/VibeAiCopilot';
import { PlasmaBackground } from '@/components/ui/PlasmaBackground';
import { useGlobalChatNotifications } from '@/src/hooks/use-global-chat';
import { usePushNotifications } from '@/src/hooks/use-push-notifications';
import { QueryProvider } from '@/src/providers/query-provider';
import { ToastProvider } from '@/src/providers/toast-provider';
import { useAuth } from '@/src/store/auth';
import { useEffectiveMode } from '@/src/store/theme';
import { appFonts } from '@/src/theme/fonts';
import { plasma } from '@/src/theme/plasma';

export const unstable_settings = {
  anchor: 'index',
};

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
  const isDark = effectiveMode === 'dark';
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

  SplashScreen.hideAsync().catch(() => undefined);

  return (
    <SafeAreaProvider style={{ backgroundColor: isDark ? plasma.baseDark : plasma.baseLight }}>
      {/* One animated plasma field behind every screen; screens and navigators are transparent. */}
      <PlasmaBackground />
      <RouterThemeProvider value={routerNavTheme(isDark)}>
        <ThemeProvider value={navTheme(isDark)}>
          <QueryProvider>
            <ToastProvider>
              <GlobalChatListener />
              <PushNotificationListener />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
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
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </RouterThemeProvider>
    </SafeAreaProvider>
  );
}

/** Navigation theme with transparent surfaces so the plasma field shows through every navigator. */
function navTheme(dark: boolean) {
  const base = dark ? DarkTheme : DefaultTheme;
  return { ...base, colors: { ...base.colors, background: 'transparent', card: 'transparent' } };
}

function routerNavTheme(dark: boolean) {
  const base = dark ? RouterDarkTheme : RouterDefaultTheme;
  return { ...base, colors: { ...base.colors, background: 'transparent', card: 'transparent' } };
}

export default wrapWithSentry(RootLayout);
