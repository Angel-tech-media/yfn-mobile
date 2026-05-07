import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { palette, spacing, typography } from '@/src/theme';

export default function ForgotPasswordScreen() {
  const [contact, setContact] = useState('');

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Forgot{'\n'}Password?</Text>
        <Text style={styles.subtitle}>We&apos;ll send you a 6-digit code to{'\n'}[email/phone]</Text>
      </View>

      <View style={styles.form}>
        <TextField
          placeholder="Email or phone number"
          value={contact}
          onChangeText={setContact}
          autoCapitalize="none"
        />
        <PrimaryButton
          label="Send OTP"
          disabled={!contact}
          onPress={() => router.push('/forgot-otp')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    paddingTop: spacing['4'],
    paddingBottom: spacing['8'],
    alignItems: 'center',
    gap: spacing['2'],
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
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
  },
  form: { gap: spacing['4'] },
});
