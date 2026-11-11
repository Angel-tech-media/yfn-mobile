import { StyleSheet } from 'react-native';

import { useEffectiveMode } from '@/src/store/theme';
import { glass, plasma } from '@/src/theme/plasma';

export type UiColors = {
  isDark: boolean;
  /** Screen background (#F6F4EB in light, #111513 in dark). */
  background: string;
  /** Default card / grouped row surface (#FDFCF8 in light, #1A201D in dark). */
  card: string;
  /** Surface sitting on top of a card (sheets, nested chips). */
  cardRaised: string;
  /** Secondary soft sage/muted surface (`bg-secondary` in Lovable). */
  secondary: string;
  secondaryForeground: string;
  /** Primary text (#162821 in light, #F4F2E8 in dark). */
  label: string;
  /** Secondary text (#5A6B62 in light, #A1ACA6 in dark). */
  secondaryLabel: string;
  /** Tertiary / placeholder text. */
  tertiaryLabel: string;
  /** Hairline separators and card borders (#E5E2D6 in light, rgba(255,255,255,0.10) in dark). */
  separator: string;
  /** Subtle fill for pills, search fields, icon buttons (`bg-muted` in Lovable). */
  fill: string;
  /** Primary brand color (#1D4A38 forest green in light, #C8FF3B electric lime in dark). */
  accent: string;
  accentPressed: string;
  /** Text on `accent` (#F7F5EC in light, #12281E in dark). */
  onAccent: string;
  /** Destructive / live highlight. */
  altarRed: string;
  /** Electric Lime badge accent (#C8FF3B). */
  lime: string;
  limeForeground: string;
  /** Warm Sunset Coral (#F06543 in light, #F26E4B in dark). */
  coral: string;
  coralForeground: string;
  /** Deep Forest Ink banner surface (`bg-ink` in Lovable). */
  ink: string;
  inkForeground: string;
  inkMuted: string;
  /** Sun Gold for star ratings and price emphasis. */
  gold: string;
  /** Primary ink gradient (`--gradient-ink`). */
  gradient: readonly [string, string];
  success: string;
  danger: string;
  /** Blur tint to pair with <BlurView> for nav / tab materials. */
  blurTint: 'dark' | 'light';
};

/**
 * Lovable "Lagos Night" Dark Mode (`yfnisaktive/src/styles.css` `.dark`):
 * Neutral dark forest charcoal (#111513), elevated charcoal cards (#1A201D),
 * warm cream foreground (#F4F2E8), electric lime primary/accent (#C8FF3B), coral (#F26E4B).
 */
const dark: UiColors = {
  isDark: true,
  background: '#111513',
  card: glass.dark.fill,
  cardRaised: glass.dark.fillRaised,
  secondary: '#222925',
  secondaryForeground: '#F4F2E8',
  label: '#F4F2E8',
  secondaryLabel: '#A1ACA6',
  tertiaryLabel: 'rgba(244, 242, 232, 0.45)',
  separator: glass.dark.rim,
  fill: glass.dark.fillSubtle,
  accent: '#C8FF3B',
  accentPressed: '#B2EA28',
  onAccent: '#12281E',
  altarRed: '#E5483B',
  lime: '#C8FF3B',
  limeForeground: '#12281E',
  coral: '#F26E4B',
  coralForeground: '#FFFFFF',
  ink: '#1C2A23',
  inkForeground: '#F6F4EB',
  inkMuted: '#A8B8AF',
  gold: '#F0BC34',
  gradient: ['#1E4434', '#142920'] as const,
  success: '#34C77B',
  danger: '#E5483B',
  blurTint: 'dark',
};

/**
 * Lovable "Lagos Paper" Light Mode (`yfnisaktive/src/styles.css` `:root`):
 * Warm cream paper (#F6F4EB), pure paper cards (#FDFCF8), deep forest-green ink (#162821),
 * forest primary (#1D4A38), electric lime (#C8FF3B), coral (#F06543).
 */
const light: UiColors = {
  isDark: false,
  background: '#F6F4EB',
  card: glass.light.fill,
  cardRaised: glass.light.fillRaised,
  secondary: '#E6EFE8',
  secondaryForeground: '#1B3B2D',
  label: '#162821',
  secondaryLabel: '#5A6B62',
  tertiaryLabel: '#8A9990',
  separator: glass.light.rim,
  fill: glass.light.fillSubtle,
  accent: '#1D4A38',
  accentPressed: '#162821',
  onAccent: '#F7F5EC',
  altarRed: '#D93B2B',
  lime: '#C8FF3B',
  limeForeground: '#12281E',
  coral: '#F06543',
  coralForeground: '#FFFFFF',
  ink: '#182B22',
  inkForeground: '#F6F4EB',
  inkMuted: '#9FB5A9',
  gold: '#D99B16',
  gradient: ['#1E4434', '#132B21'] as const,
  success: '#249C62',
  danger: '#D93B2B',
  blurTint: 'light',
};

export const solidBackground = { dark: plasma.baseDark, light: plasma.baseLight } as const;

export function useUi(): UiColors {
  return useEffectiveMode() === 'dark' ? dark : light;
}

/**
 * Typography scale using Lovable's exact font pairing:
 * - Display / Headings: Bricolage Grotesque
 * - Body / Subhead / UI: Instrument Sans
 */
export const type = {
  largeTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 30, lineHeight: 34, letterSpacing: -0.8 },
  title1: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 28, lineHeight: 32, letterSpacing: -0.7 },
  title2: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
  title3: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 18, lineHeight: 23, letterSpacing: -0.35 },
  headline: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 16, lineHeight: 21, letterSpacing: -0.2 },
  body: { fontFamily: 'InstrumentSans_400Regular', fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  callout: { fontFamily: 'InstrumentSans_500Medium', fontSize: 15, lineHeight: 21, letterSpacing: -0.1 },
  subhead: { fontFamily: 'InstrumentSans_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  footnote: { fontFamily: 'InstrumentSans_500Medium', fontSize: 12, lineHeight: 17, letterSpacing: 0 },
  caption: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  caption2: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 11, lineHeight: 14, letterSpacing: 0.1 },
} as const;

export const layout = {
  gutter: 18,
  sectionGap: 24,
  cardGap: 12,
  hairline: StyleSheet.hairlineWidth,
} as const;

export const corner = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const continuous = { borderCurve: 'continuous' as const };
