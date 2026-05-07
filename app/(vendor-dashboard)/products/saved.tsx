import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function ProductSavedScreen() {
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
      <View style={{ flex: 1 }} />
      <Animated.View style={[styles.copy, { opacity: fade, transform: [{ scale }] }]}>
        <View style={styles.bubble}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Product saved</Text>
        <Text style={styles.subtitle}>
          Buyers can now discover you in{'\n'}search, on the home feed, and in stories
        </Text>
      </Animated.View>
      <View style={styles.actions}>
        <PrimaryButton label="View My Store" onPress={() => router.replace('/vendor-store')} />
        <PrimaryButton label="Go to Dashboard" variant="ghost" onPress={() => router.replace('/vendor-dashboard')} />
      </View>
      <View style={styles.bottomSpacer} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  copy: { alignItems: 'center', gap: spacing['3'], paddingBottom: spacing['8'] },
  bubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  actions: { gap: spacing['3'] },
  bottomSpacer: { height: spacing['10'] },
});
