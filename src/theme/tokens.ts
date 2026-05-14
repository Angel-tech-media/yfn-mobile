export const palette = {
  brand: {
    // Refined honey gold — warm, premium, pairs with the honey-brown
    // background. The `orange` / `orangeDeep` keys are kept so all existing
    // references keep compiling.
    orange: '#D89544',
    orangeDeep: '#A6692E',
    amber: '#E8B864',
    // Cool accents to balance the warm honey palette.
    accentSky: '#7AB0D6',
    accentTeal: '#5DB8AE',
    accentLavender: '#A89BD4',
    accentGold: '#E8B864',
    accentCoral: '#E07A4D',
    /** Soft chartreuse — for LIVE indicators, "active now", winning state. */
    accentLime: '#C5D944',
    accentLimeDeep: '#8FA022',
  },
  bg: {
    // Warm light theme — soft white with a hint of honey at the bottom.
    // Token names kept ("espresso") for compile compatibility — the value
    // is now off-white.
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
    // Friendly cream theme — used on light surfaces (buyer profile, etc.)
    cream: '#FAF6EE',
    creamMuted: '#F2EBDD',
    creamDeep: '#E8DEC8',
    sage: '#3B5A4A',
    sageSoft: '#E5EDE7',
    coral: '#FF6F4A',
    softPeach: '#FFE8D6',
  },
  ink: {
    onLightStrong: '#141414',
    onLightSubtle: '#3B3B3B',
    // Light-theme remap — "onDark" tokens now resolve to dark text on white.
    onDarkStrong: '#141414',
    onDarkSoft: '#3B3B3B',
    onDarkMuted: '#6B6B6B',
    onDarkFaint: '#9B9B9B',
  },
  line: {
    divider: '#E5E0D6',
    onDark: 'rgba(0, 0, 0, 0.08)',
  },
  status: {
    success: '#4CAF50',
    info: '#1976D2',
    warning: '#FFC107',
    danger: '#A6692E',
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
