import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { LinkText } from '@/components/ui/LinkText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to keep where you left off</Text>
      </View>

      <View style={styles.form}>
        <TextField
          placeholder="Email or phone number"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
        />
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>Password must be 12 characters or more</Text>
          <LinkText onPress={() => router.push('/forgot-password' as never)} style={styles.helperLink}>
            Forgot password?
          </LinkText>
        </View>

        <View style={styles.loginRow}>
          <View style={styles.loginGrow}>
            <PrimaryButton label="Login" loading={submitting} onPress={handleLogin} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use biometrics"
            style={({ pressed }) => [styles.bioBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="finger-print" size={26} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.oauthRow}>
          <OAuthButton icon={<GoogleIcon />} label="Google" />
          <OAuthButton
            icon={<Ionicons name="logo-apple" size={20} color={palette.ink.onLightStrong} />}
            label="Apple"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <LinkText onPress={() => router.push('/signup' as never)}>Sign Up</LinkText>
      </View>
    </ScreenContainer>
  );
}

function OAuthButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.oauthBtn, pressed && { opacity: 0.85 }]}>
      {icon}
      <Text style={styles.oauthLabel}>{label}</Text>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIconWrap}>
      <Text style={styles.googleIcon}>G</Text>
    </View>
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
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
  },
  form: {
    gap: spacing['3'],
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -spacing['1'],
  },
  helperText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
    flex: 1,
    marginRight: spacing['2'],
  },
  helperLink: {
    fontSize: 12,
    lineHeight: 16,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginTop: spacing['2'],
  },
  loginGrow: {
    flex: 1,
  },
  bioBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginVertical: spacing['4'],
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  dividerText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  oauthBtn: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: palette.bg.surface,
  },
  oauthLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onLightStrong,
  },
  googleIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontFamily: typography.display.fontFamily,
    fontSize: 18,
    lineHeight: 20,
    color: '#4285F4',
  },
  footer: {
    paddingVertical: spacing['5'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
});
