import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  /** User-selected preference. `system` follows the OS setting (mock-defaults to dark). */
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
 * Resolve the user's selected mode to an effective mode (drops `system` to
 * `dark` for now — wire to `useColorScheme()` from RN when ready).
 */
export function useEffectiveMode(): 'light' | 'dark' {
  const mode = useTheme((s) => s.mode);
  if (mode === 'system') return 'dark';
  return mode;
}
