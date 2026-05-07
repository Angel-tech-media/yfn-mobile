import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function WithdrawConfirmedScreen() {
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  }, [scale]);

  return (
    <ScreenContainer variant="espresso">
      <View style={{ flex: 1 }} />
      <Animated.View style={[styles.copy, { transform: [{ scale }] }]}>
        <View style={styles.bubble}>
          <Ionicons name="checkmark" size={42} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Withdrawal queued</Text>
        <Text style={styles.subtitle}>
          Your funds will arrive in your account within{'\n'}1–2 business days.
        </Text>
      </Animated.View>
      <View style={styles.actions}>
        <PrimaryButton label="Back to dashboard" onPress={() => router.replace('/vendor-dashboard')} />
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
    fontSize: 26,
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
