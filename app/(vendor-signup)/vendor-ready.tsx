import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function VendorReadyScreen() {
  return (
    <ScreenContainer variant="espresso">
      <View style={styles.spacer} />
      <View style={styles.copy}>
        <Text style={styles.title}>Almost ready{'\n'}to sell!</Text>
        <Text style={styles.subtitle}>Verify your identity so buyers{'\n'}can trust you</Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label="Continue to Verification"
          onPress={() => router.push('/vendor-verify' as never)}
        />
        <PrimaryButton
          label="I'll do this later"
          variant="ghost"
          onPress={() => router.replace('/(tabs)' as never)}
        />
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
  actions: {
    gap: spacing['3'],
  },
});
