/**
 * Brand palette — graded from the official colour board.
 *
 *   Cobalt Blue   #0047AB   primary brand / strong interactive
 *   Maya Blue     #6FC3FF   light accent (Home areas, highlights)
 *   Flag Red      #D32323   alert / secondary accent (other areas)
 *   Graphite      #333333   dark surfaces / strong text
 *   Grey          #808080   secondary text & icons
 *   White Smoke   #F5F5F5   light background
 */
export const brand = {
  cobalt: '#0047AB',
  cobaltDeep: '#00367F',
  cobaltSoft: '#3A6FC4',
  maya: '#6FC3FF',
  mayaDeep: '#3FA8F0',
  mayaSoft: '#A9DBFF',
  flagRed: '#D32323',
  flagRedDeep: '#A81B1B',
  flagRedSoft: '#E86A6A',
  graphite: '#333333',
  graphiteSoft: '#4A4A4A',
  grey: '#808080',
  greyLight: '#A8A8A8',
  whiteSmoke: '#F5F5F5',
  white: '#FFFFFF',
} as const;

/**
 * Legacy `palette` shape. Every key is preserved so the ~40 modules that
 * already import `palette` keep compiling — only the *values* are re-graded to
 * the new brand colours. This is the light-mode source of truth for the many
 * screens whose styles are still static `StyleSheet.create` objects.
 */
export const palette = {
  brand: {
    // `orange*` keys kept for compile-compat — now the Cobalt brand blue.
    orange: brand.cobalt,
    orangeDeep: brand.cobaltDeep,
    amber: brand.maya,
    // Cool accents → Maya family; warm/alert accents → Flag Red family.
    accentSky: brand.maya,
    accentTeal: brand.mayaDeep,
    accentLavender: brand.cobaltSoft,
    accentGold: brand.maya,
    accentCoral: brand.flagRed,
    /** Highlight / "active now" / LIVE — Maya blue. */
    accentLime: brand.maya,
    accentLimeDeep: brand.mayaDeep,
  },
  bg: {
    // Light theme — White Smoke graded surfaces.
    espressoStart: brand.white,
    espressoMid: brand.whiteSmoke,
    espressoEnd: '#ECECEC',
    welcomePeachStart: brand.white,
    welcomePeachMid: brand.whiteSmoke,
    welcomePeachEnd: '#E4E9F2',
    surface: brand.white,
    surfaceMuted: brand.whiteSmoke,
    glassDark: 'rgba(0, 0, 0, 0.04)',
    glassDarkSoft: 'rgba(0, 0, 0, 0.04)',
    // Neutral light surfaces (kept "cream*" names for compatibility).
    cream: brand.whiteSmoke,
    creamMuted: '#ECECEC',
    creamDeep: '#E0E0E0',
    sage: brand.cobalt,
    sageSoft: '#E4ECF7',
    coral: brand.flagRed,
    softPeach: '#FBDada',
  },
  ink: {
    onLightStrong: '#1A1A1A',
    onLightSubtle: brand.graphite,
    // These resolve to dark text on light surfaces (light theme).
    onDarkStrong: '#1A1A1A',
    onDarkSoft: brand.graphite,
    onDarkMuted: brand.grey,
    onDarkFaint: brand.greyLight,
  },
  line: {
    divider: '#E3E3E3',
    onDark: 'rgba(0, 0, 0, 0.08)',
  },
  status: {
    success: '#4CAF50',
    info: brand.cobalt,
    warning: '#FFC107',
    danger: brand.flagRed,
  },
  shadow: {
    overlay05: 'rgba(0,0,0,0.05)',
    overlay20: 'rgba(0,0,0,0.20)',
  },
} as const;

/**
 * Semantic colour roles, resolved per colour-scheme. New / migrated components
 * should consume these via `useColors()` (see src/store/theme.ts) so they react
 * to light/dark. `accentHome` is Maya blue; `accentAlt` is Flag Red.
 */
export type SemanticColors = {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  brandPrimary: string;
  brandPrimaryText: string;
  accentHome: string;
  accentAlt: string;
  tabActive: string;
  tabInactive: string;
  tabBarBg: string;
  danger: string;
  success: string;
};

export const lightColors: SemanticColors = {
  background: brand.whiteSmoke,
  backgroundElevated: brand.white,
  surface: brand.white,
  surfaceMuted: '#FAFAFA',
  textPrimary: '#1A1A1A',
  textSecondary: brand.grey,
  textMuted: brand.greyLight,
  border: '#E3E3E3',
  brandPrimary: brand.cobalt,
  brandPrimaryText: brand.white,
  accentHome: brand.maya,
  accentAlt: brand.flagRed,
  tabActive: brand.cobalt,
  tabInactive: brand.grey,
  tabBarBg: brand.white,
  danger: brand.flagRed,
  success: '#3BA55D',
};

export const darkColors: SemanticColors = {
  background: '#1C1C1C',
  backgroundElevated: '#262626',
  surface: '#2A2A2A',
  surfaceMuted: brand.graphite,
  textPrimary: brand.whiteSmoke,
  textSecondary: brand.greyLight,
  textMuted: brand.grey,
  border: 'rgba(255, 255, 255, 0.12)',
  // Cobalt is too dark on a dark bg — Maya carries the brand in dark mode.
  brandPrimary: brand.maya,
  brandPrimaryText: '#0A0A0A',
  accentHome: brand.maya,
  accentAlt: brand.flagRedSoft,
  tabActive: brand.maya,
  tabInactive: brand.grey,
  tabBarBg: '#222222',
  danger: brand.flagRedSoft,
  success: '#4CC76A',
};

export type ColorScheme = 'light' | 'dark';

export const getColors = (scheme: ColorScheme): SemanticColors =>
  scheme === 'dark' ? darkColors : lightColors;

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
