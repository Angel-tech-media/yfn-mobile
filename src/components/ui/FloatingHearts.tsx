import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const { height: SH } = Dimensions.get('window');

type HeartProps = {
  index: number;
};

function Heart({ index }: HeartProps) {
  const animY = useRef(new Animated.Value(0)).current;
  const animX = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  // Store randomized values so they don't change on re-render
  const swayRange = useRef(40 + Math.random() * 60).current;
  const direction = useRef(Math.random() > 0.5 ? 1 : -1).current;
  const maxScale = useRef(0.8 + Math.random() * 0.7).current;

  useEffect(() => {
    // Randomize starting delay based on index so they don't all appear at once
    const delay = index * 400 + Math.random() * 600;
    const duration = 3000 + Math.random() * 2000;

    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Move up
          Animated.timing(animY, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          // Sway left/right
          Animated.timing(animX, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          // Fade in and out
          Animated.sequence([
            Animated.timing(animOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.delay(duration - 1200),
            Animated.timing(animOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]),
          // Pop in scale
          Animated.spring(scale, { toValue: maxScale, useNativeDriver: true }),
        ]),
        // Reset for loop
        Animated.timing(animY, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(animX, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(animOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, [animX, animY, animOpacity, scale, index, maxScale]);

  const translateY = animY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SH * 0.6],
  });

  const translateX = animX.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, swayRange * direction, 0],
  });

  return (
    <Animated.View
      style={[
        styles.heart,
        {
          opacity: animOpacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}>
      <Ionicons name="heart" size={28} color="#EF4444" />
    </Animated.View>
  );
}

export function FloatingHearts({ count }: { count: number }) {
  if (count <= 0) return null;
  // Cap at max 12 bubbles to prevent performance issues
  const bubbles = Math.min(count, 12);

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: bubbles }).map((_, i) => (
        <Heart key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    zIndex: 5,
  },
  heart: {
    position: 'absolute',
    bottom: 80,
  },
});
