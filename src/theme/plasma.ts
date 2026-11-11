import { StyleSheet } from 'react-native';

/**
 * Obsidian Glass & Warm Sunset Terracotta Design System for Vibe.
 *
 * Combines Apple / Threads razor-sharp neutral carbon glass (#08080C + rgba(22, 22, 27, 0.76))
 * with warm African-sunlit plasma accents (Sunset Terracotta #E85D3F, Burnished Amber #F59E0B,
 * Hibiscus Wine #881337, and 24k Gold #F5C469).
 */

export const plasma = {
  /** True deep OLED carbon base — crisp, never muddy. */
  baseDark: '#08080C',
  baseLight: '#F8F7F4',

  /** Warm Sunset & Earth Plasma Palette. */
  terracotta: '#E85D3F',
  terracottaDeep: '#C94124',
  amber: '#F59E0B',
  gold: '#F5C469',
  hibiscus: '#9F1239',
  alabaster: '#F8FAFC',

  /** Semantic aliases used across components. */
  nude: '#E85D3F',
  nudeDeep: '#C94124',
  sand: '#F5C469',
  champagne: '#F5C469',
  taupe: '#A1A1AA',
  stone: '#18181D',
  espresso: '#0E0E12',

  blue: '#E85D3F',
  violet: '#C94124',
  cyan: '#F59E0B',
  magenta: '#9F1239',
  mint: '#30D158',
  coral: '#E5262F',

  /** Gradients. */
  cool: ['#E85D3F', '#C94124'] as const,
  warm: ['#F59E0B', '#E85D3F'] as const,
  aurora: ['#E85D3F', '#C94124', '#9F1239'] as const,
  spectrum: ['#F59E0B', '#E85D3F'] as const,
} as const;

/**
 * Crisp Apple iOS 18 neutral smoked-obsidian glass surface tokens.
 */
export const glass = {
  dark: {
    /** Standard card / grouped row fill — neutral carbon glass with zero brown muddiness. */
    fill: 'rgba(22, 22, 27, 0.76)',
    /** Raised surface (modals, floating sheets, inputs). */
    fillRaised: 'rgba(32, 32, 39, 0.86)',
    /** Subtle pill / search bar fill. */
    fillSubtle: 'rgba(255, 255, 255, 0.07)',
    /** Top-to-bottom specular highlight gradient inside a glass card. */
    sheen: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.00)'] as const,
    /** Crisp white hairline border catching the ambient light. */
    rim: 'rgba(255, 255, 255, 0.12)',
    /** Stronger rim for tab bar, sheets, and focused inputs. */
    rimStrong: 'rgba(255, 255, 255, 0.22)',
    blurIntensity: 50,
    blurTint: 'dark' as const,
  },
  light: {
    fill: 'rgba(255, 255, 255, 0.84)',
    fillRaised: 'rgba(255, 255, 255, 0.94)',
    fillSubtle: 'rgba(15, 15, 20, 0.05)',
    sheen: ['rgba(255, 255, 255, 0.90)', 'rgba(255, 255, 255, 0.25)'] as const,
    rim: 'rgba(15, 15, 20, 0.08)',
    rimStrong: 'rgba(15, 15, 20, 0.15)',
    blurIntensity: 55,
    blurTint: 'light' as const,
  },
} as const;

export const display = StyleSheet.create({
  hero: {
    fontFamily: 'InterTight_800ExtraBold',
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.4,
  },
  heroCaps: {
    fontFamily: 'InterTight_800ExtraBold',
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1.1,
    textTransform: 'uppercase',
  },
  section: {
    fontFamily: 'InterTight_700Bold',
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.8,
  },
  stat: {
    fontFamily: 'InterTight_700Bold',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.0,
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
