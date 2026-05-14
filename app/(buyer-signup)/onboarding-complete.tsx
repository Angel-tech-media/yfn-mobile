import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function OnboardingCompleteScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);

  return (
    <ScreenContainer variant="espresso">
      <View style={styles.spacer} />
      <Animated.View style={[styles.copy, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <Text style={styles.title}>Welcome to Vibe</Text>
        <Text style={styles.subtitle}>Start exploring vendors, products{'\n'}and stories near you</Text>
      </Animated.View>
      <Animated.View style={{ opacity: fade }}>
        <PrimaryButton label="Continue" onPress={() => router.replace('/(tabs)' as never)} />
      </Animated.View>
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
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 34,
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
});
