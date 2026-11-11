import { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { plasma } from '@/src/theme/plasma';
import { useEffectiveMode } from '@/src/store/theme';

type OrbSpec = {
  color: string;
  size: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  period: number;
  opacity: number;
};

const Orb = memo(function Orb({ spec, width, height, still }: { spec: OrbSpec; width: number; height: number; still: boolean }) {
  const t = useSharedValue(0);
  const d = spec.size * width;
  const id = `orb-${spec.color.replace(/[^a-z0-9]/gi, '')}-${Math.round(spec.x * 100)}`;

  useEffect(() => {
    if (still) return;
    t.value = withRepeat(
      withTiming(1, { duration: spec.period * 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(t);
  }, [spec.period, still, t]);

  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateX: spec.dx * width * (t.value - 0.5) * 2 },
      { translateY: spec.dy * width * Math.sin(t.value * Math.PI) },
      { scale: 1 + 0.1 * Math.sin(t.value * Math.PI) },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: d,
          height: d,
          left: spec.x * width - d / 2,
          top: spec.y * height - d / 2,
          opacity: spec.opacity,
        },
        animated,
      ]}>
      <Svg width={d} height={d}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={spec.color} stopOpacity={1} />
            <Stop offset="0.4" stopColor={spec.color} stopOpacity={0.48} />
            <Stop offset="0.75" stopColor={spec.color} stopOpacity={0.12} />
            <Stop offset="1" stopColor={spec.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={d} height={d} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
});

/**
 * Warm African Sunset Plasma over deep OLED Carbon (#08080C):
 * - Top-left: Sunset Terracotta (#E85D3F)
 * - Mid-right: Deep Hibiscus Wine (#9F1239)
 * - Top-right: Burnished Amber Gold (#F59E0B)
 * - Bottom-left: Warm Copper (#C94124)
 */
const DARK_ORBS: OrbSpec[] = [
  { color: '#E85D3F', size: 1.25, x: 0.08, y: 0.14, dx: 0.11, dy: 0.07, period: 15, opacity: 0.26 },
  { color: '#9F1239', size: 1.15, x: 0.92, y: 0.44, dx: 0.09, dy: 0.1, period: 18, opacity: 0.22 },
  { color: '#F59E0B', size: 0.85, x: 0.86, y: 0.06, dx: 0.08, dy: 0.05, period: 21, opacity: 0.16 },
  { color: '#C94124', size: 1.1, x: 0.16, y: 0.88, dx: 0.12, dy: 0.07, period: 17, opacity: 0.20 },
];

const LIGHT_ORBS: OrbSpec[] = [
  { color: '#E85D3F', size: 1.2, x: 0.08, y: 0.14, dx: 0.1, dy: 0.07, period: 15, opacity: 0.12 },
  { color: '#F59E0B', size: 1.0, x: 0.88, y: 0.44, dx: 0.09, dy: 0.1, period: 18, opacity: 0.10 },
];

export function PlasmaBackground() {
  const { width, height } = useWindowDimensions();
  const mode = useEffectiveMode();
  const reduceMotion = useReducedMotion();
  const isDark = mode === 'dark';
  const orbs = isDark ? DARK_ORBS : LIGHT_ORBS;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? plasma.baseDark : plasma.baseLight }]}>
      {orbs.map((o, i) => (
        <Orb key={`${mode}-${i}`} spec={o} width={width} height={height} still={reduceMotion} />
      ))}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="45%" r="75%">
            <Stop offset="0.55" stopColor={isDark ? plasma.baseDark : plasma.baseLight} stopOpacity={0} />
            <Stop offset="1" stopColor={isDark ? plasma.baseDark : plasma.baseLight} stopOpacity={isDark ? 0.72 : 0.4} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#vignette)" />
      </Svg>
    </View>
  );
}
