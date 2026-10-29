import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useToast } from '@/src/hooks/use-toast';
import { useAuth } from '@/src/store/auth';
import { palette, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const signIn = useAuth((s) => s.signIn);
  const toast = useToast();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => usernameOrEmail.trim().length > 0 && password.length >= 8 && !submitting,
    [usernameOrEmail, password, submitting],
  );

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const result = await signIn({
      usernameOrEmail: usernameOrEmail.trim(),
      password,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error('Login failed', {
        description: result.reason,
      });
      return;
    }

    const userRole = result.user?.role === 'vendor' ? 'vendor' : 'buyer';
    toast.success(`Welcome back${result.user?.name ? `, ${result.user.name}` : ''}!`, {
      description: `Signed in as ${userRole === 'vendor' ? 'Vendor' : 'Buyer'}`,
      icon: 'hand-right',
    });
    router.replace('/(home-feed)/(tabs)' as never);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>
      </View>

      <View style={styles.form}>
        <TextField
          placeholder="Username or email"
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          isPassword
        />

        <View style={styles.forgotRow}>
          <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>

        <PrimaryButton
          label="Log in"
          onPress={submit}
          disabled={!canSubmit}
          loading={submitting}
        />

        {__DEV__ ? (
          <View style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: palette.ink.onDarkMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
              Quick Fill Demo Accounts
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => {
                  setUsernameOrEmail('vendor@example.com');
                  setPassword('Password123!');
                }}
                style={{ flex: 1, backgroundColor: 'rgba(255, 159, 10, 0.14)', padding: 10, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: palette.brand.orange, fontSize: 12, fontWeight: '700' }}>
                  Demo Vendor
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setUsernameOrEmail('buyer@example.com');
                  setPassword('Password123!');
                }}
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', padding: 10, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: palette.ink.onDarkStrong, fontSize: 12, fontWeight: '700' }}>
                  Demo Buyer
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to Vibe?</Text>
        <Pressable onPress={() => router.push('/signup')} hitSlop={8}>
          <Text style={styles.footerLink}>Create account</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    paddingTop: spacing['6'],
    paddingBottom: spacing['8'],
    alignItems: 'center',
    gap: spacing['2'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['5'],
  },
  form: {
    gap: spacing['3'],
    paddingTop: spacing['2'],
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing['1'],
    marginBottom: spacing['2'],
  },
  forgotText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand.orange,
  },
  footer: {
    paddingVertical: spacing['5'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  footerText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  footerLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.brand.orange,
  },
});
