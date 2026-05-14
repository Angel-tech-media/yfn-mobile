import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '@/src/theme';

type Props = {
  label?: string;
  /** Pulsing dot animation. Defaults to true. */
  pulse?: boolean;
};

/**
 * Chartreuse "LIVE" pill — pulsing dot + uppercase label. Drop it as an
 * absolute child onto any cover/hero/feed card to mark live content.
 */
export function LivePill({ label = 'LIVE', pulse = true }: Props) {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, pulse]);

  return (
    <View style={styles.pill}>
      <Animated.View style={[styles.dot, { opacity: anim }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.brand.accentLime,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.bg.espressoEnd,
  },
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    color: palette.bg.espressoEnd,
  },
});
