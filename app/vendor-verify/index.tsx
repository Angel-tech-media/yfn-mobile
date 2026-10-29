import { StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

const CHECKLIST = [
  'Government-issued ID',
  'Tax Identification Number (TIN)',
  'Profile photo',
  'Date of birth confirmation',
];

export default function VerifyIntroScreen() {
  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.iconBlock}>
        <Image
          source={require('@/assets/figma/verify-logo.png')}
          style={styles.iconBubble}
          contentFit="contain"
        />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.subtitle}>Your info is encrypted and secure</Text>
      </View>

      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>Verification Checklist</Text>
        {CHECKLIST.map((item) => (
          <Text key={item} style={styles.checklistItem}>• {item}</Text>
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <PrimaryButton label="Start Verification" onPress={() => router.push('/vendor-verify/id-type')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconBlock: {
    alignItems: 'center',
    paddingTop: spacing['8'],
    paddingBottom: spacing['6'],
  },
  iconBubble: {
    width: 140,
    height: 140,
  },
  titleBlock: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingBottom: spacing['6'],
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
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
  },
  checklistCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    gap: spacing['1'],
  },
  checklistTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['2'],
  },
  checklistItem: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: palette.ink.onDarkSoft,
  },
  spacer: { flex: 1 },
  actions: {
    paddingVertical: spacing['4'],
  },
});
