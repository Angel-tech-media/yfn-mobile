import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Pref = { key: string; label: string; description: string; defaultOn?: boolean };

const SECTIONS: Array<{ title: string; rows: Pref[] }> = [
  {
    title: 'Push',
    rows: [
      { key: 'orders', label: 'Order updates', description: 'Status changes and shipping events', defaultOn: true },
      { key: 'messages', label: 'Direct messages', description: 'New chats from buyers and vendors', defaultOn: true },
      { key: 'follows', label: 'New followers', description: 'Someone started following you', defaultOn: true },
      { key: 'likes', label: 'Likes & comments', description: 'Engagement on your posts and reels' },
    ],
  },
  {
    title: 'Email',
    rows: [
      { key: 'order-emails', label: 'Order receipts', description: 'Email confirmation for purchases', defaultOn: true },
      { key: 'newsletter', label: 'Vibe weekly', description: 'Trending vendors and product picks' },
      { key: 'promos', label: 'Promo codes & flash sales', description: 'Limited-time discounts' },
    ],
  },
  {
    title: 'Marketing',
    rows: [
      { key: 'inapp', label: 'In-app banners', description: 'Sale alerts and feature spotlights', defaultOn: true },
      { key: 'sms', label: 'SMS alerts', description: 'Critical security and order alerts only', defaultOn: true },
    ],
  },
];

export default function NotificationPrefsScreen() {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    SECTIONS.forEach((s) => s.rows.forEach((r) => { init[r.key] = !!r.defaultOn; }));
    return init;
  });

  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Notifications" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.list}>
              {section.rows.map((row) => (
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
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: spacing['5'] },
  section: { gap: spacing['2'] },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
});
