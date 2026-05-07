import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Row = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: string;
  hint?: string;
};

const SECTIONS: Array<{ title: string; rows: Row[] }> = [
  {
    title: 'Account',
    rows: [
      { key: 'edit', label: 'Profile', icon: 'person-outline', href: '/account/edit', hint: 'David Okpo' },
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
      { key: 'terms', label: 'Terms of service', icon: 'document-text-outline' },
      { key: 'privacy-policy', label: 'Privacy policy', icon: 'document-text-outline' },
      { key: 'about', label: 'About Vibe', icon: 'information-circle-outline', hint: 'v1.0.0' },
    ],
  },
];

export default function SettingsScreen() {
  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Settings" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SECTIONS.map((section) => (
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
          <PrimaryButton label="Sign out" variant="ghost" onPress={() => router.replace('/login')} />
          <Pressable hitSlop={8} style={styles.dangerLink}>
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
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
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
