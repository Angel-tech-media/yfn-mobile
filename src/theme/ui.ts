import { StyleSheet } from 'react-native';

import { useEffectiveMode } from '@/src/store/theme';
import { glass, plasma } from '@/src/theme/plasma';

export type UiColors = {
  isDark: boolean;
  /** Screen background. Transparent so the root plasma field shows through. */
  background: string;
  /** Default card / grouped row surface. Smoked obsidian glass. */
  card: string;
  /** Surface sitting on top of a card (sheets, nested chips). Raised glass. */
  cardRaised: string;
  /** Primary text (#FAFAFA). */
  label: string;
  /** Secondary text. */
  secondaryLabel: string;
  /** Tertiary / placeholder text. */
  tertiaryLabel: string;
  /** Hairline separators and the crisp glass rim. */
  separator: string;
  /** Subtle fill for pills, search fields, icon buttons. */
  fill: string;
  /** Warm Sunset Terracotta accent (#E85D3F). */
  accent: string;
  accentPressed: string;
  /** Crisp white text on terracotta accent buttons (#FFFFFF). */
  onAccent: string;
  /** Destructive / live highlight. */
  altarRed: string;
  /** Electric Lime badge accent from Lovable ("Lagos Paper") */
  lime: string;
  limeForeground: string;
  /** Warm Sunset Coral */
  coral: string;
  /** 24k Champagne Gold for prices and ratings (#F5C469). */
  gold: string;
  /** Warm terracotta gradient. */
  gradient: readonly [string, string];
  success: string;
  danger: string;
  /** Blur tint to pair with <BlurView> for nav / tab materials. */
  blurTint: 'dark' | 'light';
};

const dark: UiColors = {
  isDark: true,
  background: 'transparent',
  card: glass.dark.fill,
  cardRaised: glass.dark.fillRaised,
  label: '#FAFAFA',
  secondaryLabel: 'rgba(250, 250, 250, 0.65)',
  tertiaryLabel: 'rgba(250, 250, 250, 0.42)',
  separator: glass.dark.rim,
  fill: glass.dark.fillSubtle,
  accent: '#E85D3F',
  accentPressed: '#C94124',
  onAccent: '#FFFFFF',
  altarRed: '#E5262F',
  lime: '#C8FF3B',
  limeForeground: '#121815',
  coral: '#F06543',
  gold: '#F5C469',
  gradient: ['#E85D3F', '#C94124'] as const,
  success: '#30D158',
  danger: '#E5262F',
  blurTint: 'dark',
};

const light: UiColors = {
  isDark: false,
  background: 'transparent',
  card: glass.light.fill,
  cardRaised: glass.light.fillRaised,
  label: '#09090B',
  secondaryLabel: 'rgba(9, 9, 11, 0.62)',
  tertiaryLabel: 'rgba(9, 9, 11, 0.40)',
  separator: glass.light.rimStrong,
  fill: glass.light.fillSubtle,
  accent: '#E85D3F',
  accentPressed: '#C94124',
  onAccent: '#FFFFFF',
  altarRed: '#E5262F',
  lime: '#99D61E',
  limeForeground: '#121815',
  coral: '#E85D3F',
  gold: '#B47814',
  gradient: ['#E85D3F', '#C94124'] as const,
  success: '#34C759',
  danger: '#E5262F',
  blurTint: 'light',
};

export const solidBackground = { dark: plasma.baseDark, light: plasma.baseLight } as const;

export function useUi(): UiColors {
  return useEffectiveMode() === 'dark' ? dark : light;
}

export const type = {
  largeTitle: { fontFamily: 'InterTight_700Bold', fontSize: 34, lineHeight: 38, letterSpacing: -1.1 },
  title1: { fontFamily: 'InterTight_700Bold', fontSize: 28, lineHeight: 32, letterSpacing: -0.8 },
  title2: { fontFamily: 'InterTight_600SemiBold', fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
  title3: { fontFamily: 'InterTight_600SemiBold', fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  headline: { fontFamily: 'Inter_600SemiBold', fontSize: 17, lineHeight: 22, letterSpacing: -0.4 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 24, letterSpacing: -0.4 },
  callout: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22, letterSpacing: -0.3 },
  subhead: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 21, letterSpacing: -0.2 },
  footnote: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, letterSpacing: -0.08 },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  caption2: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 13, letterSpacing: 0.06 },
} as const;

export const layout = {
  gutter: 16,
  sectionGap: 28,
  cardGap: 12,
  hairline: StyleSheet.hairlineWidth,
} as const;

export const corner = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const continuous = { borderCurve: 'continuous' } as const;

export const elevation = {
  none: {},
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 0,
  },
  glow: {
    shadowColor: '#E85D3F',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  candleGlow: {
    shadowColor: '#E85D3F',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;
