import { useMemo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

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
import { useToast } from '@/src/hooks/use-toast';
import { useAuth } from '@/src/store/auth';
import { palette, radius, spacing, typography } from '@/src/theme';

const signupSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Phone too short'),
  password: z
    .string()
    .min(12, 'At least 12 characters')
    .regex(/[A-Z]/, 'Add at least one uppercase letter')
    .regex(/\d/, 'Add at least one number'),
  dob: z.string().min(1, 'Choose your date of birth'),
  gender: z.string().min(1, 'Pick a gender'),
  agreed: z.literal(true, { message: 'Accept the terms to continue' }),
});

type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not';

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'non-binary', label: 'Non-binary' },
  { key: 'prefer-not', label: 'Prefer not to say' },
];

export default function SignupScreen() {
  const { role } = useLocalSearchParams<{ role?: 'vendor' | 'buyer' }>();
  const toast = useToast();
  const signUp = useAuth((s) => s.signUp);
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
  const [submitting, setSubmitting] = useState(false);

  const validation = useMemo(() => {
    return signupSchema.safeParse({
      name,
      email,
      phone,
      password,
      dob,
      gender: gender ?? '',
      agreed,
    });
  }, [name, email, phone, password, dob, gender, agreed]);

  /** Per-field errors only shown if the user has typed in that field. */
  const errors = useMemo(() => {
    const errs: Partial<Record<'name' | 'email' | 'phone' | 'password' | 'dob' | 'gender' | 'agreed', string>> = {};
    if (validation.success) return errs;
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof typeof errs;
      // Don't yell at empty fields the user hasn't touched yet
      const value =
        key === 'name' ? name :
        key === 'email' ? email :
        key === 'phone' ? phone :
        key === 'password' ? password :
        key === 'dob' ? dob :
        key === 'gender' ? gender :
        agreed;
      if (value) errs[key] = issue.message;
    }
    return errs;
  }, [validation, name, email, phone, password, dob, gender, agreed]);

  const canSubmit = validation.success && !submitting;

  const handleSubmit = async () => {
    if (!validation.success) return;
    setSubmitting(true);
    const result = await signUp({
      name,
      email,
      phone,
      password,
      role: isVendor ? 'vendor' : 'buyer',
      dob,
      gender: gender ?? undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error('Could not create account', {
        description:
          result.reason === 'Validation failed'
            ? 'Check your details and try again.'
            : result.reason,
      });
      return;
    }
    router.push(isVendor ? '/verify?role=vendor' : '/verify?role=buyer');
  };

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
            loading={submitting}
            onPress={handleSubmit}
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
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
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
    color: palette.ink.onLightStrong,
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
    backgroundColor: 'rgba(216, 149, 68,0.10)',
  },
  sheetLabel: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onLightStrong,
  },
});
