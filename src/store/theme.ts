import { useColorScheme } from 'react-native';
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  /** User-selected preference. Defaults to midnight worship dark mode. */
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  /** Cycle: dark → light → system → dark. Useful for a single tap-toggle button. */
  cycle: () => void;
};

export const useTheme = create<ThemeState>((set) => ({
  mode: 'dark',
  setMode: (mode) => set({ mode }),
  cycle: () =>
    set((s) => ({
      mode:
        s.mode === 'dark' ? 'light' : s.mode === 'light' ? 'system' : 'dark',
    })),
}));

/**
 * Resolve the user's selected mode to an effective mode.
 * When `system` is selected, resolves to the phone's actual color scheme.
 */
export function useEffectiveMode(): 'light' | 'dark' {
  const mode = useTheme((s) => s.mode);
  const systemScheme = useColorScheme();
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}
