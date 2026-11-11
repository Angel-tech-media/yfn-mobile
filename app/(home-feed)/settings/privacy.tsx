import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Pref = { key: string; label: string; description: string; defaultOn?: boolean };

const TOGGLES: Pref[] = [
  { key: 'private', label: 'Private account', description: 'Only approved followers see your posts' },
  { key: 'tagged', label: 'Approve tags', description: 'Review who can tag you in posts' },
  { key: 'mentions', label: 'Allow @ mentions', description: 'Receive @ notifications from anyone', defaultOn: true },
  { key: 'discoverable', label: 'Show in suggestions', description: 'Help buyers discover your profile', defaultOn: true },
  { key: 'dms', label: 'DMs from anyone', description: 'Allow direct messages from non-followers' },
];

const ROWS: Array<{ key: string; label: string; icon: keyof typeof Ionicons.glyphMap; href?: string; hint?: string }> = [
  { key: 'blocked', label: 'Blocked accounts', icon: 'ban-outline', hint: '0' },
  { key: 'restricted', label: 'Restricted accounts', icon: 'remove-circle-outline', hint: '0' },
  { key: 'export', label: 'Download my data', icon: 'cloud-download-outline' },
  { key: 'deactivate', label: 'Deactivate account', icon: 'pause-outline' },
];

export default function PrivacyScreen() {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    TOGGLES.forEach((r) => { init[r.key] = !!r.defaultOn; });
    return init;
  });

  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Privacy" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Visibility</Text>
        <View style={styles.list}>
          {TOGGLES.map((row) => (
            <View key={row.key} style={styles.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.description}>{row.description}</Text>
              </View>
              <Switch
                value={!!state[row.key]}
                onValueChange={() => toggle(row.key)}
                trackColor={{ false: 'rgba(0, 0, 0, 0.10)', true: palette.brand.orange }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.list}>
          {ROWS.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => r.href && router.push(r.href as never)}
              style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.85 }]}>
              <View style={styles.iconWrap}>
                <Ionicons name={r.icon} size={18} color={palette.ink.onDarkSoft} />
              </View>
              <Text style={styles.rowLabel}>{r.label}</Text>
              {r.hint ? <Text style={styles.hint}>{r.hint}</Text> : null}
              <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: spacing['3'] },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
    marginTop: spacing['3'],
  },
  list: { gap: spacing['1'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    minHeight: 64,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    height: 56,
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
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
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  description: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
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
});
