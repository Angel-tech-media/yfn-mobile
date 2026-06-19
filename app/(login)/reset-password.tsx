import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useToast } from '@/src/hooks/use-toast';
import { palette, spacing, typography } from '@/src/theme';

type Rule = { key: string; label: string; check: (p: string) => boolean };

const RULES: Rule[] = [
  { key: 'len', label: 'At least 8 characters', check: (p) => p.length >= 8 },
  { key: 'num', label: 'A number', check: (p) => /\d/.test(p) },
  { key: 'special', label: 'A special character', check: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordScreen() {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const toast = useToast();

  const passes = useMemo(() => RULES.map((r) => ({ ...r, ok: r.check(pw) })), [pw]);
  const allOk = passes.every((p) => p.ok) && pw === pw2 && pw.length > 0;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Set new{'\n'}password</Text>
        <Text style={styles.subtitle}>Choose a new password</Text>
      </View>

      <View style={styles.form}>
        <TextField placeholder="Create new password" value={pw} onChangeText={setPw} isPassword />
        <TextField placeholder="Repeat password" value={pw2} onChangeText={setPw2} isPassword />

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>Password must contain:</Text>
          {passes.map((r) => (
            <View key={r.key} style={styles.rule}>
              <Ionicons
                name={r.ok ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={r.ok ? palette.brand.orange : palette.ink.onDarkMuted}
              />
              <Text style={[styles.ruleLabel, r.ok && styles.ruleOk]}>{r.label}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton
          label="Send OTP"
          disabled={!allOk}
          onPress={() => {
            toast.success('Password updated', {
              description: 'You can now sign in with your new password',
              icon: 'shield-checkmark',
            });
            router.replace('/login');
          }}
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
  form: { gap: spacing['3'] },
  rules: {
    gap: spacing['1'],
    paddingVertical: spacing['2'],
  },
  rulesTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['1'],
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  ruleLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
  },
  ruleOk: {
    color: palette.ink.onDarkStrong,
  },
});
