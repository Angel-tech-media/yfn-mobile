import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

import { palette, typography } from '@/src/theme';

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Set false to drop the hive mark and render the wordmark alone. */
  showMark?: boolean;
};

const sizeMap = {
  sm: { fontSize: 18, lineHeight: 22, letterSpacing: 1.5, mark: 22 },
  md: { fontSize: 24, lineHeight: 28, letterSpacing: 2, mark: 30 },
  lg: { fontSize: 36, lineHeight: 40, letterSpacing: 2.5, mark: 44 },
  xl: { fontSize: 56, lineHeight: 60, letterSpacing: 3, mark: 68 },
} as const;

export function BrandLogo({
  size = 'md',
  color = palette.ink.onDarkStrong,
  style,
  showMark = true,
}: Props) {
  const s = sizeMap[size];
  return (
    <View style={styles.row}>
      {showMark ? <HiveMark size={s.mark} /> : null}
      <Text
        style={[
          styles.text,
          {
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color,
          },
          style,
        ]}>
        VIBE
      </Text>
    </View>
  );
}

/** Honeycomb cluster — three hex cells arranged in a hive grouping. */
export function HiveMark({ size = 44 }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const v = 100;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${v} ${v}`}>
        <Defs>
          <LinearGradient id="hiveGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.brand.amber} stopOpacity="1" />
            <Stop offset="1" stopColor={palette.brand.orangeDeep} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Top cell */}
        {hexagon(50, 26, 22, 'url(#hiveGrad)')}
        {/* Bottom-left cell */}
        {hexagon(30, 60, 22, 'url(#hiveGrad)')}
        {/* Bottom-right cell */}
        {hexagon(70, 60, 22, 'url(#hiveGrad)')}
      </Svg>
    </View>
  );
}

/** Single hex used inline elsewhere when we want one cell only. */
export function HexBadge({ size = 22 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="hexGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.brand.amber} stopOpacity="1" />
            <Stop offset="1" stopColor={palette.brand.orangeDeep} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {hexagon(50, 50, 44, 'url(#hexGrad)')}
      </Svg>
    </View>
  );
}

/** Pointy-top hex polygon centred on (cx, cy) with circumradius r. */
function hexagon(cx: number, cy: number, r: number, fill: string) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // start at top
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
  return (
    <Polygon
      points={points}
      fill={fill}
      stroke={palette.bg.espressoEnd}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontFamily: typography.display.fontFamily,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
