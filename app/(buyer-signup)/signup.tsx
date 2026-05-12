import { useMemo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Checkbox } from '@/components/ui/Checkbox';
import { CountryPhoneField } from '@/components/ui/CountryPhoneField';
import { DatePickerSheet } from '@/components/ui/DatePickerSheet';
import { LinkText } from '@/components/ui/LinkText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not';

const GENDER_OPTIONS: Array<{ key: Gender; label: string }> = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'non-binary', label: 'Non-binary' },
  { key: 'prefer-not', label: 'Prefer not to say' },
];

export default function SignupScreen() {
  const { role } = useLocalSearchParams<{ role?: 'vendor' | 'buyer' }>();
  const isVendor = role === 'vendor';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);

  const errors = useMemo(() => {
    const errs: { email?: string; phone?: string; password?: string } = {};
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (phone && phone.length < 7) errs.phone = 'Phone too short';
    if (password && password.length < 12) errs.password = 'At least 12 characters';
    return errs;
  }, [email, phone, password]);

  const canSubmit = useMemo(
    () =>
      name && email && phone && password.length >= 12 && gender && dob && agreed && !Object.keys(errors).length,
    [name, email, phone, password, gender, dob, agreed, errors]
  );

  const genderLabel = gender ? GENDER_OPTIONS.find((o) => o.key === gender)?.label : undefined;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {isVendor ? 'Start selling\non Vibe' : 'Create your\naccount'}
          </Text>
        </View>

        <View style={styles.form}>
          <TextField placeholder="Full name" value={name} onChangeText={setName} />
          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />
          <CountryPhoneField value={phone} onChangeText={setPhone} />
          {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
          <TextField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />
          <Text style={styles.helperText}>Password must be 12 characters or more</Text>
          <SelectField
            value={genderLabel}
            placeholder="Gender"
            onPress={() => setGenderOpen(true)}
          />
          <SelectField
            value={dob || undefined}
            placeholder="Date of birth"
            onPress={() => setDobOpen(true)}
            rightIcon="calendar-outline"
          />

          <View style={styles.terms}>
            <Checkbox
              checked={agreed}
              onChange={setAgreed}
              label={
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy.</Text>
                </Text>
              }
            />
          </View>

          <PrimaryButton
            label="Create Account"
            disabled={!canSubmit}
            onPress={() =>
              router.push(isVendor ? '/verify?role=vendor' : '/verify?role=buyer')
            }
          />

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
          <Text style={styles.footerText}>Already have an account? </Text>
          <LinkText onPress={() => router.replace('/login')}>Log in</LinkText>
        </View>
      </ScrollView>

      <DatePickerSheet
        visible={dobOpen}
        onClose={() => setDobOpen(false)}
        onConfirm={(d) => {
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          setDob(`${dd} / ${mm} / ${yyyy}`);
        }}
        title="Date of birth"
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
      />

      <BottomSheet visible={genderOpen} onClose={() => setGenderOpen(false)}>
        <Text style={styles.sheetTitle}>Select gender</Text>
        {GENDER_OPTIONS.map((opt) => {
          const selected = gender === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                setGender(opt.key);
                setGenderOpen(false);
              }}
              style={({ pressed }) => [
                styles.sheetRow,
                selected && styles.sheetRowSelected,
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={styles.sheetLabel}>{opt.label}</Text>
              {selected ? (
                <Ionicons name="checkmark" size={18} color={palette.brand.orange} />
              ) : null}
            </Pressable>
          );
        })}
      </BottomSheet>
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
  scroll: {
    paddingBottom: spacing['8'],
  },
  titleBlock: {
    paddingTop: spacing['2'],
    paddingBottom: spacing['6'],
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
  },
  form: {
    gap: spacing['3'],
  },
  helperText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
    marginTop: -spacing['2'],
  },
  fieldError: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.status.danger,
    marginTop: -spacing['2'],
  },
  terms: {
    paddingVertical: spacing['1'],
  },
  termsText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  termsLink: {
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginVertical: spacing['2'],
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
  googleIconWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  googleIcon: {
    fontFamily: typography.display.fontFamily,
    fontSize: 18,
    lineHeight: 20,
    color: '#4285F4',
  },
  footer: {
    paddingTop: spacing['5'],
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
  sheetTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['3'],
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
  },
  sheetRowSelected: {
    backgroundColor: 'rgba(253,134,22,0.10)',
  },
  sheetLabel: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onDarkStrong,
  },
});
