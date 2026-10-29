import { StyleSheet } from 'react-native';

import { useEffectiveMode } from '@/src/store/theme';

/**
 * Semantic, iOS-style colors. Use these (via `useUi()`) instead of hardcoded hex values so every
 * screen shares the same layered surfaces, separators and label hierarchy in light and dark.
 */
export type UiColors = {
  isDark: boolean;
  /** Screen background (systemGroupedBackground). Midnight Base in dark mode. */
  background: string;
  /** Default card / grouped row surface. Night Surface in dark mode. */
  card: string;
  /** Surface sitting on top of a card (sheets, nested chips). Night Surface Raised. */
  cardRaised: string;
  /** Primary text. Candle White in dark mode. */
  label: string;
  /** Secondary text. Candle White 65%. */
  secondaryLabel: string;
  /** Tertiary / placeholder text. Candle White 40%. */
  tertiaryLabel: string;
  /** Hairline separators. Subtle blue-tinted midnight line. */
  separator: string;
  /** Subtle fill for pills, search fields, icon buttons. */
  fill: string;
  /** Glory Blue accent. */
  accent: string;
  accentPressed: string;
  onAccent: string;
  /** Altar Flame Red highlight. */
  altarRed: string;
  /** Gold strictly and only for prices and ratings. */
  gold: string;
  /** Red-to-blue gradient (#FF3B3B to #2F6BFF at 135°). */
  gradient: readonly [string, string];
  success: string;
  danger: string;
  /** Blur tint to pair with <BlurView> for nav / tab materials. */
  blurTint: 'dark' | 'light';
};

const dark: UiColors = {
  isDark: true,
  background: '#0A0E1F',
  card: '#121833',
  cardRaised: '#1A2244',
  label: '#F5F1EA',
  secondaryLabel: 'rgba(245, 241, 234, 0.65)',
  tertiaryLabel: 'rgba(245, 241, 234, 0.40)',
  separator: 'rgba(47, 107, 255, 0.16)',
  fill: 'rgba(47, 107, 255, 0.12)',
  accent: '#2F6BFF',
  accentPressed: '#2050D8',
  onAccent: '#F5F1EA',
  altarRed: '#E5262F',
  gold: '#F4C464',
  gradient: ['#FF3B3B', '#2F6BFF'] as const,
  success: '#30D158',
  danger: '#E5262F',
  blurTint: 'dark',
};

const light: UiColors = {
  isDark: false,
  background: '#F5F6FA',
  card: '#FFFFFF',
  cardRaised: '#F0F3FA',
  label: '#0A0E1F',
  secondaryLabel: 'rgba(10, 14, 31, 0.65)',
  tertiaryLabel: 'rgba(10, 14, 31, 0.40)',
  separator: 'rgba(47, 107, 255, 0.14)',
  fill: 'rgba(47, 107, 255, 0.08)',
  accent: '#2F6BFF',
  accentPressed: '#2050D8',
  onAccent: '#FFFFFF',
  altarRed: '#E5262F',
  gold: '#F4C464',
  gradient: ['#FF3B3B', '#2F6BFF'] as const,
  success: '#34C759',
  danger: '#E5262F',
  blurTint: 'light',
};

export function useUi(): UiColors {
  return useEffectiveMode() === 'dark' ? dark : light;
}

/** Apple HIG text styles (Dynamic Type "large" sizes). Font family stays on the brand face. */
export const type = {
  largeTitle: { fontFamily: 'Inter_700Bold', fontSize: 34, lineHeight: 41, letterSpacing: -0.8 },
  title1: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  title2: { fontFamily: 'Inter_600SemiBold', fontSize: 22, lineHeight: 28, letterSpacing: -0.45 },
  title3: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 25, letterSpacing: -0.4 },
  headline: { fontFamily: 'Inter_600SemiBold', fontSize: 17, lineHeight: 22, letterSpacing: -0.4 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 24, letterSpacing: -0.4 },
  callout: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22, letterSpacing: -0.3 },
  subhead: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 21, letterSpacing: -0.2 },
  footnote: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, letterSpacing: -0.08 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  caption2: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 13, letterSpacing: 0.06 },
} as const;

/** 4pt layout grid. Screens use `gutter` for horizontal padding so edges always line up. */
export const layout = {
  gutter: 16,
  sectionGap: 28,
  cardGap: 12,
  hairline: StyleSheet.hairlineWidth,
} as const;

/** Corner radii. Pair with `continuous` so corners are Apple-style squircles on iOS. */
export const corner = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const continuous = { borderCurve: 'continuous' } as const;

/** Soft, low-contrast elevation & candlelight glow effects. */
export const elevation = {
  none: {},
  card: {
    shadowColor: '#2F6BFF',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  glow: {
    shadowColor: '#2F6BFF',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  candleGlow: {
    shadowColor: '#FF3B3B',
    shadowOpacity: 0.20,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;
