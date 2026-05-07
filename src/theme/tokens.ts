export const palette = {
  brand: {
    orange: '#FD8616',
    orangeDeep: '#FF3D00',
    amber: '#FFC107',
  },
  bg: {
    espressoStart: '#4A2614',
    espressoMid: '#2A140A',
    espressoEnd: '#160903',
    welcomePeachStart: '#F4C9B6',
    welcomePeachMid: '#D89077',
    welcomePeachEnd: '#5A2A1A',
    surface: '#FFFFFF',
    surfaceMuted: '#FAFAFA',
    glassDark: 'rgba(20,12,8,0.55)',
    glassDarkSoft: 'rgba(255,255,255,0.06)',
  },
  ink: {
    onLightStrong: '#141414',
    onLightSubtle: '#242424',
    onDarkStrong: '#FFFFFF',
    onDarkSoft: 'rgba(255,255,255,0.80)',
    onDarkMuted: 'rgba(255,255,255,0.60)',
    onDarkFaint: 'rgba(255,255,255,0.50)',
  },
  line: {
    divider: '#D9D9D9',
    onDark: 'rgba(255,255,255,0.20)',
  },
  status: {
    success: '#4CAF50',
    info: '#1976D2',
    warning: '#FFC107',
    danger: '#FF3D00',
  },
  shadow: {
    overlay05: 'rgba(0,0,0,0.05)',
    overlay20: 'rgba(0,0,0,0.20)',
  },
} as const;

export const radius = {
  xs: 2,
  sm: 5,
  md: 10,
  lg: 16,
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
  display: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32, lineHeight: 36 },
  h1: { fontFamily: 'Manrope_700Bold', fontSize: 32, lineHeight: 38 },
  h2: { fontFamily: 'Manrope_700Bold', fontSize: 24, lineHeight: 30 },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: 'Manrope_400Regular', fontSize: 16, lineHeight: 22 },
  body: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 19 },
  bodyEmphasis: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 16 },
  small: { fontFamily: 'Manrope_400Regular', fontSize: 10, lineHeight: 14 },
  buttonLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, lineHeight: 22 },
} as const;

export const gradient = {
  espresso: {
    type: 'radial' as const,
    colors: [palette.bg.espressoStart, palette.bg.espressoMid, palette.bg.espressoEnd],
    locations: [0, 0.55, 1] as [number, number, number],
  },
  welcomePeach: {
    type: 'linear' as const,
    colors: [palette.bg.welcomePeachStart, palette.bg.welcomePeachMid, palette.bg.welcomePeachEnd],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

export type Palette = typeof palette;
export type Radius = typeof radius;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
