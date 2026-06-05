import { useColorScheme } from 'react-native';
import { create } from 'zustand';

import { getColors, type ColorScheme, type SemanticColors } from '@/src/theme/tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  /** User-selected preference. `system` follows the OS setting. */
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  /** Cycle: light → dark → system → light. Useful for a single tap-toggle button. */
  cycle: () => void;
};

export const useTheme = create<ThemeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
  cycle: () =>
    set((s) => ({
      mode: s.mode === 'light' ? 'dark' : s.mode === 'dark' ? 'system' : 'light',
    })),
}));

/**
 * Resolve the user's selected mode to an effective scheme. `system` follows the
 * OS appearance via React Native's `useColorScheme()`.
 */
export function useEffectiveMode(): ColorScheme {
  const mode = useTheme((s) => s.mode);
  const system = useColorScheme();
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}

/**
 * Active semantic colours for the effective scheme. New / migrated components
 * should build their styles from this (inside the component, not at module
 * scope) so they react to light/dark changes.
 */
export function useColors(): SemanticColors {
  return getColors(useEffectiveMode());
}
