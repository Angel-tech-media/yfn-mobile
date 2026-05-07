import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, spacing, typography } from '@/src/theme';

export default function StoreLiveScreen() {
  return (
    <ScreenContainer variant="espresso">
      <View style={styles.spacer} />
      <View style={styles.copy}>
        <Text style={styles.title}>Your store is live!</Text>
        <Text style={styles.subtitle}>
          Buyers can now discover you in{'\n'}search, on the home feed, and in{'\n'}stories
        </Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="View My Store" onPress={() => router.replace('/(tabs)')} />
        <PrimaryButton label="Go to Dashboard" variant="ghost" onPress={() => router.replace('/(tabs)')} />
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
  actions: { gap: spacing['3'] },
});
