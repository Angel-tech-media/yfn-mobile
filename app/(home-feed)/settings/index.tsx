import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useMe } from '@/src/api/account/hooks';
import { useDeleteAccount } from '@/src/api/moderation/hooks';
import { useAuth } from '@/src/store/auth';
import { useTheme, type ThemeMode } from '@/src/store/theme';
import { palette, radius, spacing, typography } from '@/src/theme';

type Row = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: string;
  hint?: string;
};

function buildSections(profileHint?: string): Array<{ title: string; rows: Row[] }> {
  return [
  {
    title: 'Account',
    rows: [
      { key: 'edit', label: 'Profile', icon: 'person-outline', href: '/account/edit', hint: profileHint },
      { key: 'addresses', label: 'Saved addresses', icon: 'location-outline', href: '/account/addresses' },
      { key: 'payments', label: 'Payment methods', icon: 'card-outline', href: '/account/payment-methods' },
      { key: 'password', label: 'Change password', icon: 'lock-closed-outline', href: '/reset-password' },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { key: 'notifs', label: 'Notification preferences', icon: 'notifications-outline', href: '/settings/notifications' },
      { key: 'privacy', label: 'Privacy', icon: 'shield-checkmark-outline', href: '/settings/privacy' },
      { key: 'language', label: 'Language', icon: 'globe-outline', hint: 'English' },
      { key: 'currency', label: 'Currency', icon: 'cash-outline', hint: 'NGN ₦' },
    ],
  },
  {
    title: 'Support',
    rows: [
      { key: 'help', label: 'Help & support', icon: 'help-circle-outline', href: '/help' },
      { key: 'terms', label: 'Terms of service', icon: 'document-text-outline', href: '/settings/terms' },
      { key: 'privacy-policy', label: 'Privacy policy', icon: 'document-text-outline', href: '/settings/privacy-policy' },
      { key: 'about', label: 'About Vibe', icon: 'information-circle-outline', hint: 'v1.0.0' },
    ],
  },
  ];
}

function ThemeToggle() {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.setMode);

  const options: Array<{ key: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { key: 'light', label: 'Day', icon: 'sunny' },
    { key: 'dark', label: 'Night', icon: 'moon' },
    { key: 'system', label: 'System', icon: 'phone-portrait' },
  ];

  return (
    <View style={styles.themeRow}>
      {options.map((o) => {
        const on = mode === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => setMode(o.key)}
            style={[styles.themeOption, on && styles.themeOptionOn]}>
            <Ionicons
              name={o.icon}
              size={16}
              color={on ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
            />
            <Text style={[styles.themeLabel, on && styles.themeLabelOn]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { data: me } = useMe();
  const signOut = useAuth((s) => s.signOut);
  const sections = buildSections(me?.name || me?.displayName || me?.username);
  const deleteAccount = useDeleteAccount();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All active sessions, profile details, and tokens will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount.mutateAsync();
              await signOut();
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              router.replace('/login');
            } catch (err: any) {
              Alert.alert(
                'Deletion Failed',
                err?.message || 'Could not delete account. If you have active orders in progress, please resolve them first.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer>
      <TopBar title="Settings" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <ThemeToggle />
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.list}>
              {section.rows.map((row) => (
                <Pressable
                  key={row.key}
                  onPress={() => row.href && router.push(row.href as never)}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={row.icon} size={18} color={palette.ink.onDarkSoft} />
                  </View>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  {row.hint ? <Text style={styles.hint}>{row.hint}</Text> : null}
                  <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.dangerWrap}>
          <PrimaryButton
            label="Sign out"
            variant="ghost"
            onPress={async () => {
              await signOut();
              router.replace('/login');
            }}
          />
          <Pressable hitSlop={8} onPress={handleDeleteAccount} style={styles.dangerLink}>
            <Text style={styles.dangerLabel}>Delete account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 60, gap: spacing['5'] },
  section: { gap: spacing['2'] },
  themeRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    gap: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
  },
  themeOptionOn: {
    backgroundColor: palette.bg.surface,
  },
  themeLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  themeLabelOn: { color: palette.ink.onLightStrong },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
    marginTop: spacing['2'],
  },
  list: { gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    height: 56,
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  rowLabel: {
    flex: 1,
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  hint: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  dangerWrap: {
    marginTop: spacing['4'],
    gap: spacing['3'],
    alignItems: 'center',
  },
  dangerLink: { paddingVertical: spacing['2'] },
  dangerLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.status.danger,
  },
});
