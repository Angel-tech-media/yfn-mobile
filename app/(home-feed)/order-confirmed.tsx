import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function OrderConfirmedScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(fade, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [scale, fade]);

  return (
    <ScreenContainer variant="espresso">
      <View style={styles.spacer} />
      <Animated.View style={[styles.copy, { opacity: fade, transform: [{ scale }] }]}>
        <View style={styles.bubble}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Order placed!</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent the details to your email.{'\n'}You can track it from your orders page.
        </Text>
      </Animated.View>
      <View style={styles.actions}>
        <PrimaryButton label="View orders" onPress={() => router.replace('/orders')} />
        <PrimaryButton label="Continue shopping" variant="ghost" onPress={() => router.replace('/(tabs)/shop' as never)} />
      </View>
      <View style={styles.bottomSpacer} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { flex: 1 },
  bottomSpacer: { height: spacing['10'] },
  copy: {
    alignItems: 'center',
    gap: spacing['3'],
    paddingBottom: spacing['8'],
  },
  bubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  actions: { gap: spacing['3'] },
});
