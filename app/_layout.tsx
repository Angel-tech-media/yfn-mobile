import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { QueryProvider } from '@/src/providers/query-provider';
import { appFonts } from '@/src/theme/fonts';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'index',
};

/**
 * Root navigator. Each top-level entry corresponds 1:1 to a Figma section
 * (or a utility route). Per-section options live in the section's own
 * `_layout.tsx`. See `app/architecture.md` for the full Figma → code map.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        <StatusBar style="light" />
      </ThemeProvider>
    </QueryProvider>
  );
}
