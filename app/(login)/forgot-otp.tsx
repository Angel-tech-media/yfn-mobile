import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { OtpInput } from '@/components/ui/OtpInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useToast } from '@/src/hooks/use-toast';
import { palette, spacing, typography } from '@/src/theme';

const RESEND = 30;

export default function ForgotOtpScreen() {
  const [code, setCode] = useState('');
  const [s, setS] = useState(RESEND);
  const toast = useToast();

  useEffect(() => {
    if (s <= 0) return;
    const t = setInterval(() => setS((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [s]);

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to{'\n'}[email/phone]</Text>
      </View>

      <View style={styles.form}>
        <OtpInput value={code} onChange={setCode} autoFocus />
        <View style={styles.resendRow}>
          {s > 0 ? (
            <Text style={styles.info}>Resend code in {s}s</Text>
          ) : (
            <Text style={styles.info}>Didn&apos;t get the code?</Text>
          )}
          <Pressable disabled={s > 0} onPress={() => {
            setS(RESEND);
            toast.info('Code resent', {
              description: 'A new code has been sent to your email or phone',
              icon: 'refresh',
            });
          }} hitSlop={6}>
            <Text style={[styles.cta, s > 0 && { color: palette.ink.onDarkFaint }]}>Resend</Text>
          </Pressable>
        </View>
        <PrimaryButton
          label="Verify"
          disabled={code.length !== 6}
          onPress={() => router.push('/reset-password')}
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
  form: { gap: spacing['5'] },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  cta: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand.orange,
  },
});
