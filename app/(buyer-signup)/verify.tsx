import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { OtpInput } from '@/components/ui/OtpInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, spacing, typography } from '@/src/theme';

const RESEND_SECONDS = 30;

export default function VerifyScreen() {
  const { role } = useLocalSearchParams<{ role?: 'vendor' | 'buyer' }>();
  const isVendor = role === 'vendor';
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const canVerify = code.length === 6;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Verify your{'\n'}account</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to [email/phone]</Text>
      </View>

      <View style={styles.form}>
        <OtpInput value={code} onChange={setCode} autoFocus />

        <View style={styles.resendRow}>
          {secondsLeft > 0 ? (
            <Text style={styles.resendInfo}>
              Resend code in <Text style={styles.resendInfoStrong}>{secondsLeft}s</Text>
            </Text>
          ) : (
            <Text style={styles.resendInfo}>Didn&apos;t get the code?</Text>
          )}
          <Pressable
            disabled={secondsLeft > 0}
            onPress={() => setSecondsLeft(RESEND_SECONDS)}
            hitSlop={6}>
            <Text
              style={[
                styles.resendCta,
                secondsLeft > 0 && { color: palette.ink.onDarkFaint },
              ]}>
              Resend
            </Text>
          </Pressable>
        </View>

        <PrimaryButton
          label="Verify"
          disabled={!canVerify}
          onPress={() =>
            router.replace(isVendor ? '/vendor-ready' : '/onboarding-complete')
          }
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
  form: {
    gap: spacing['5'],
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendInfo: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  resendInfoStrong: {
    color: palette.ink.onDarkStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  resendCta: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand.orange,
  },
});
