import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function VerifyCompleteScreen() {
  return (
    <ScreenContainer variant="espresso">
      <View style={styles.spacer} />
      <View style={styles.copy}>
        <View style={styles.successBubble}>
          <Ionicons name="checkmark" size={42} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Verification submitted</Text>
        <Text style={styles.subtitle}>
          We&apos;ll review your details and let you know{'\n'}within 24 hours.
        </Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Continue to store setup" onPress={() => router.replace('/vendor-store-setup' as never)} />
        <PrimaryButton label="Go to dashboard" variant="ghost" onPress={() => router.replace('/(tabs)' as never)} />
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
  successBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    marginBottom: spacing['4'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
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
  actions: {
    gap: spacing['3'],
  },
});
