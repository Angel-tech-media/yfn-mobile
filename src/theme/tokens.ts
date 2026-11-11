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
  espressoStart: '#111513',
  espressoMid: '#151B18',
  espressoEnd: '#111513',
  welcomePeachStart: '#111513',
  welcomePeachMid: '#151B18',
  welcomePeachEnd: '#111513',
  surface: '#1A201D',
  surfaceMuted: '#222925',
  glassDark: 'rgba(255, 255, 255, 0.08)',
  glassDarkSoft: 'rgba(255, 255, 255, 0.05)',
  cream: '#1A201D',
  creamMuted: '#222925',
  creamDeep: '#2A332E',
  sage: '#1E4434',
  sageSoft: '#162821',
  coral: '#F26E4B',
  softPeach: '#222925',
};

const lightBg = {
  espressoStart: '#F6F4EB',
  espressoMid: '#F1EFE4',
  espressoEnd: '#EAE7DA',
  welcomePeachStart: '#F6F4EB',
  welcomePeachMid: '#F1EFE4',
  welcomePeachEnd: '#EAE7DA',
  surface: '#FDFCF8',
  surfaceMuted: '#ECE9DF',
  glassDark: 'rgba(22, 40, 33, 0.05)',
  glassDarkSoft: 'rgba(22, 40, 33, 0.03)',
  cream: '#FDFCF8',
  creamMuted: '#ECE9DF',
  creamDeep: '#E5E2D6',
  sage: '#1D4A38',
  sageSoft: '#E6EFE8',
  coral: '#F06543',
  softPeach: '#FCEAE4',
};

const darkInk = {
  onLightStrong: '#F4F2E8',
  onLightSubtle: '#A1ACA6',
  onDarkStrong: '#F4F2E8',
  onDarkSoft: 'rgba(244, 242, 232, 0.85)',
  onDarkMuted: '#A1ACA6',
  onDarkFaint: 'rgba(244, 242, 232, 0.45)',
};

const lightInk = {
  onLightStrong: '#162821',
  onLightSubtle: '#5A6B62',
  onDarkStrong: '#162821',
  onDarkSoft: 'rgba(22, 40, 33, 0.84)',
  onDarkMuted: '#5A6B62',
  onDarkFaint: '#8A9990',
};

const darkLine = {
  divider: 'rgba(255, 255, 255, 0.10)',
  onDark: 'rgba(255, 255, 255, 0.10)',
};

const lightLine = {
  divider: '#E5E2D6',
  onDark: '#E5E2D6',
};

export const palette = {
  brand: {
    orange: '#1D4A38',
    orangeDeep: '#162821',
    gloryBlue: '#1D4A38',
    altarRed: '#F06543',
    amber: '#E8B228',
    gold: '#E8B228',
    accentSky: '#8EC5E8',
    accentTeal: '#1D4A38',
    accentLavender: '#F06543',
    accentGold: '#E8B228',
    accentCoral: '#F06543',
    accentLime: '#C8FF3B',
    accentLimeDeep: '#1D4A38',
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
    success: '#2BB673',
    info: '#1D4A38',
    warning: '#E8B228',
    danger: '#E5483B',
  },
  shadow: {
    overlay05: 'rgba(22, 40, 33, 0.05)',
    overlay20: 'rgba(22, 40, 33, 0.18)',
  },
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 26,
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
  display: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 32, lineHeight: 36, letterSpacing: -0.9 },
  h1: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 28, lineHeight: 32, letterSpacing: -0.7 },
  h2: { fontFamily: 'BricolageGrotesque_700Bold', fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
  title: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: 'InstrumentSans_400Regular', fontSize: 16, lineHeight: 22 },
  body: { fontFamily: 'InstrumentSans_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  bodyEmphasis: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 14, lineHeight: 20, letterSpacing: -0.1 },
  caption: { fontFamily: 'InstrumentSans_500Medium', fontSize: 12, lineHeight: 16 },
  small: { fontFamily: 'InstrumentSans_500Medium', fontSize: 11, lineHeight: 14 },
  buttonLabel: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 16, lineHeight: 22 },
} as const;

export const gradient = {
  primary: {
    colors: ['#1E4434', '#132B21'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  espresso: {
    type: 'linear' as const,
    colors: ['#F6F4EB', '#F1EFE4'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  welcomePeach: {
    type: 'linear' as const,
    colors: ['#F6F4EB', '#F1EFE4'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

export type Palette = typeof palette;
export type Radius = typeof radius;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
