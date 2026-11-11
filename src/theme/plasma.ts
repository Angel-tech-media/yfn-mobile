import { StyleSheet } from 'react-native';

/**
 * Aktive Design System — "Lagos Paper" (Light) & "Lagos Night" (Dark)
 * Ported directly from Lovable (`yfnisaktive/src/styles.css`):
 * - Light: warm cream paper (#F6F4EB), deep forest-green ink (#162821),
 *   forest primary (#1D4A38), electric lime (#C8FF3B), coral (#F06543).
 * - Dark: neutral forest charcoal (#111513), elevated card (#1A201D),
 *   warm cream text (#F4F2E8), electric lime primary/accent (#C8FF3B), coral (#F26E4B).
 */
export const plasma = {
  /** Base screen backgrounds. */
  baseDark: '#111513',
  baseLight: '#F6F4EB',

  /** Lovable Core Brand Tokens. */
  lime: '#C8FF3B',
  limeForeground: '#12281E',
  forestInk: '#162821',
  forestPrimary: '#1D4A38',
  coral: '#F06543',
  coralDark: '#F26E4B',
  sun: '#E8B228',
  sky: '#8EC5E8',

  /** Backwards-compatible semantic aliases mapped to Lagos Paper / Night. */
  terracotta: '#F06543',
  terracottaDeep: '#1D4A38',
  amber: '#E8B228',
  gold: '#E8B228',
  hibiscus: '#F06543',
  alabaster: '#F6F4EB',
  nude: '#1D4A38',
  nudeDeep: '#162821',
  sand: '#E8B228',
  champagne: '#E8B228',
  taupe: '#6C7D73',
  stone: '#1A201D',
  espresso: '#111513',

  blue: '#1D4A38',
  violet: '#162821',
  cyan: '#C8FF3B',
  magenta: '#F06543',
  mint: '#2BB673',

  /** Gradients matching Lovable's `--gradient-ink`, `--gradient-lime`, `--gradient-story`. */
  inkGradient: ['#1E4434', '#132B21'] as const,
  limeGradient: ['#D4FF52', '#B7F024'] as const,
  cool: ['#1E4434', '#132B21'] as const,
  warm: ['#C8FF3B', '#F06543'] as const,
  aurora: ['#C8FF3B', '#F06543', '#E8B228'] as const,
  spectrum: ['#C8FF3B', '#F06543'] as const,
  story: ['#C8FF3B', '#F06543', '#E8B228', '#C8FF3B'] as const,
} as const;

/**
 * Surface tokens for "Lagos Night" (dark) and "Lagos Paper" (light).
 */
export const glass = {
  dark: {
    /** Elevated charcoal card surface (`oklch(0.22 0.006 150)`). */
    fill: '#1A201D',
    /** Raised modal / sheet / input surface (`oklch(0.26 0.006 150)`). */
    fillRaised: '#222925',
    /** Subtle pill / muted surface. */
    fillSubtle: '#222925',
    /** Subtle top highlight sheen. */
    sheen: ['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.00)'] as const,
    /** Border token (`oklch(1 0 0 / 10%)`). */
    rim: 'rgba(255, 255, 255, 0.10)',
    /** Stronger border (`oklch(1 0 0 / 15%)`). */
    rimStrong: 'rgba(255, 255, 255, 0.16)',
    blurIntensity: 50,
    blurTint: 'dark' as const,
  },
  light: {
    /** Crisp warm-white paper card (`oklch(0.993 0.006 95)`). */
    fill: '#FDFCF8',
    /** Raised surface. */
    fillRaised: '#FFFFFF',
    /** Muted cream surface (`oklch(0.945 0.014 95)`). */
    fillSubtle: '#ECE9DF',
    sheen: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.40)'] as const,
    /** Warm paper border (`oklch(0.9 0.018 100)`). */
    rim: '#E5E2D6',
    rimStrong: '#D8D4C5',
    blurIntensity: 55,
    blurTint: 'light' as const,
  },
} as const;

export const display = StyleSheet.create({
  hero: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  largeTitle: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.9,
  },
  title1: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.7,
  },
  title2: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  stat: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
});
