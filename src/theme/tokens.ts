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
  espressoStart: '#0A0E1F',
  espressoMid: '#0A0E1F',
  espressoEnd: '#0A0E1F',
  welcomePeachStart: '#0A0E1F',
  welcomePeachMid: '#121833',
  welcomePeachEnd: '#0A0E1F',
  surface: '#121833',
  surfaceMuted: '#1A2244',
  glassDark: 'rgba(47, 107, 255, 0.12)',
  glassDarkSoft: 'rgba(47, 107, 255, 0.06)',
  cream: '#121833',
  creamMuted: '#1A2244',
  creamDeep: '#1E274D',
  sage: '#1E3027',
  sageSoft: '#14221A',
  coral: '#E5262F',
  softPeach: '#1A2244',
};

const lightBg = {
  espressoStart: '#FFFFFF',
  espressoMid: '#FAF7F1',
  espressoEnd: '#F2EDE3',
  welcomePeachStart: '#FFFFFF',
  welcomePeachMid: '#FAF7F1',
  welcomePeachEnd: '#E8DCC4',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  glassDark: 'rgba(0, 0, 0, 0.04)',
  glassDarkSoft: 'rgba(0, 0, 0, 0.04)',
  cream: '#FAF6EE',
  creamMuted: '#F2EBDD',
  creamDeep: '#E8DEC8',
  sage: '#3B5A4A',
  sageSoft: '#E5EDE7',
  coral: '#E5262F',
  softPeach: '#FFE8D6',
};

const darkInk = {
  onLightStrong: '#F5F1EA',
  onLightSubtle: 'rgba(245, 241, 234, 0.75)',
  onDarkStrong: '#F5F1EA',
  onDarkSoft: 'rgba(245, 241, 234, 0.85)',
  onDarkMuted: 'rgba(245, 241, 234, 0.65)',
  onDarkFaint: 'rgba(245, 241, 234, 0.40)',
};

const lightInk = {
  onLightStrong: '#0A0E1F',
  onLightSubtle: 'rgba(10, 14, 31, 0.75)',
  onDarkStrong: '#0A0E1F',
  onDarkSoft: 'rgba(10, 14, 31, 0.85)',
  onDarkMuted: 'rgba(10, 14, 31, 0.65)',
  onDarkFaint: 'rgba(10, 14, 31, 0.40)',
};

const darkLine = {
  divider: 'rgba(47, 107, 255, 0.16)',
  onDark: 'rgba(47, 107, 255, 0.16)',
};

const lightLine = {
  divider: '#E5E0D6',
  onDark: 'rgba(0, 0, 0, 0.08)',
};

export const palette = {
  brand: {
    orange: '#2F6BFF',
    orangeDeep: '#2050D8',
    gloryBlue: '#2F6BFF',
    altarRed: '#E5262F',
    amber: '#F4C464',
    gold: '#F4C464',
    accentSky: '#5B8EFF',
    accentTeal: '#2F6BFF',
    accentLavender: '#7C67FF',
    accentGold: '#F4C464',
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
    info: '#2F6BFF',
    warning: '#F4C464',
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
  lg: 18,
  xl: 24,
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
  display: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, letterSpacing: -0.7 },
  h1: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  h2: { fontFamily: 'Inter_600SemiBold', fontSize: 22, lineHeight: 28, letterSpacing: -0.45 },
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
    colors: ['#FF3B3B', '#2F6BFF'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  espresso: {
    type: 'linear' as const,
    colors: ['#0A0E1F', '#0A0E1F'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  welcomePeach: {
    type: 'linear' as const,
    colors: ['#0A0E1F', '#121833'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

export type Palette = typeof palette;
export type Radius = typeof radius;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
