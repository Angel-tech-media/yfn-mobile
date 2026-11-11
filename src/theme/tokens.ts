import { Appearance } from 'react-native';
import { useTheme } from '../store/theme';

export function isDarkMode(): boolean {
  try {
    const mode = useTheme.getState().mode;
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
  } catch {}
  return Appearance.getColorScheme() === 'dark';
}

const darkBg = {
  espressoStart: '#08080C',
  espressoMid: '#0E0E14',
  espressoEnd: '#08080C',
  welcomePeachStart: '#08080C',
  welcomePeachMid: '#0E0E14',
  welcomePeachEnd: '#08080C',
  surface: 'rgba(22, 22, 27, 0.76)',
  surfaceMuted: 'rgba(32, 32, 39, 0.84)',
  glassDark: 'rgba(255, 255, 255, 0.08)',
  glassDarkSoft: 'rgba(255, 255, 255, 0.05)',
  cream: 'rgba(22, 22, 27, 0.76)',
  creamMuted: 'rgba(32, 32, 39, 0.84)',
  creamDeep: 'rgba(42, 42, 50, 0.88)',
  sage: '#18261F',
  sageSoft: '#121C17',
  coral: '#E5262F',
  softPeach: 'rgba(32, 32, 39, 0.84)',
};

const lightBg = {
  espressoStart: '#F8F7F4',
  espressoMid: '#F3F1EC',
  espressoEnd: '#EAE6DF',
  welcomePeachStart: '#F8F7F4',
  welcomePeachMid: '#F3F1EC',
  welcomePeachEnd: '#EAE6DF',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  glassDark: 'rgba(0, 0, 0, 0.04)',
  glassDarkSoft: 'rgba(0, 0, 0, 0.03)',
  cream: '#FAF8F5',
  creamMuted: '#F2EFE9',
  creamDeep: '#E6E1D8',
  sage: '#3B5A4A',
  sageSoft: '#E5EDE7',
  coral: '#E5262F',
  softPeach: '#FDECE6',
};

const darkInk = {
  onLightStrong: '#FAFAFA',
  onLightSubtle: 'rgba(250, 250, 250, 0.75)',
  onDarkStrong: '#FAFAFA',
  onDarkSoft: 'rgba(250, 250, 250, 0.85)',
  onDarkMuted: 'rgba(250, 250, 250, 0.62)',
  onDarkFaint: 'rgba(250, 250, 250, 0.40)',
};

const lightInk = {
  onLightStrong: '#09090B',
  onLightSubtle: 'rgba(9, 9, 11, 0.72)',
  onDarkStrong: '#09090B',
  onDarkSoft: 'rgba(9, 9, 11, 0.82)',
  onDarkMuted: 'rgba(9, 9, 11, 0.60)',
  onDarkFaint: 'rgba(9, 9, 11, 0.38)',
};

const darkLine = {
  divider: 'rgba(255, 255, 255, 0.12)',
  onDark: 'rgba(255, 255, 255, 0.12)',
};

const lightLine = {
  divider: 'rgba(9, 9, 11, 0.09)',
  onDark: 'rgba(9, 9, 11, 0.09)',
};

export const palette = {
  brand: {
    orange: '#E85D3F',
    orangeDeep: '#C94124',
    gloryBlue: '#E85D3F',
    altarRed: '#E5262F',
    amber: '#F5C469',
    gold: '#F5C469',
    accentSky: '#F59E0B',
    accentTeal: '#E85D3F',
    accentLavender: '#9F1239',
    accentGold: '#F5C469',
    accentCoral: '#E5262F',
    accentLime: '#30D158',
    accentLimeDeep: '#249C42',
  },
  get bg() {
    return isDarkMode() ? darkBg : lightBg;
  },
  get ink() {
    return isDarkMode() ? darkInk : lightInk;
  },
  get line() {
    return isDarkMode() ? darkLine : lightLine;
  },
  status: {
    success: '#30D158',
    info: '#E85D3F',
    warning: '#F5C469',
    danger: '#E5262F',
  },
  shadow: {
    overlay05: 'rgba(0,0,0,0.05)',
    overlay20: 'rgba(0,0,0,0.20)',
  },
};

export const radius = {
  xs: 2,
  sm: 6,
  md: 12,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  px: 1,
  '0_5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
} as const;

export const typography = {
  display: { fontFamily: 'InterTight_700Bold', fontSize: 34, lineHeight: 36, letterSpacing: -1.1 },
  h1: { fontFamily: 'InterTight_700Bold', fontSize: 28, lineHeight: 32, letterSpacing: -0.8 },
  h2: { fontFamily: 'InterTight_600SemiBold', fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  bodyEmphasis: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  small: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 14 },
  buttonLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
} as const;

export const gradient = {
  primary: {
    colors: ['#E85D3F', '#C94124'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  espresso: {
    type: 'linear' as const,
    colors: ['#08080C', '#0E0E14'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  welcomePeach: {
    type: 'linear' as const,
    colors: ['#08080C', '#0E0E14'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

export type Palette = typeof palette;
export type Radius = typeof radius;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
