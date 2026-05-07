import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Faq = { id: string; question: string; answer: string };

const TOPICS: Array<{ key: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'orders', label: 'Orders & shipping', icon: 'cube-outline' },
  { key: 'returns', label: 'Returns & refunds', icon: 'arrow-undo-outline' },
  { key: 'payments', label: 'Payments', icon: 'card-outline' },
  { key: 'vendor', label: 'Selling on Vibe', icon: 'storefront-outline' },
  { key: 'account', label: 'Account & security', icon: 'lock-closed-outline' },
  { key: 'content', label: 'Posts, stories & reels', icon: 'sparkles-outline' },
];

const FAQ: Faq[] = [
  { id: 'q1', question: 'How long does delivery take?', answer: 'Most orders arrive in 2–4 business days within Lagos and 4–7 days nationwide.' },
  { id: 'q2', question: 'How do I become a vendor?', answer: 'Tap the "Become a vendor" CTA on your profile. You\'ll be guided through identity verification and store setup in under 10 minutes.' },
  { id: 'q3', question: 'Can I return an item?', answer: 'Yes — most items are eligible for return within 7 days of delivery. Open the order and tap "Request return".' },
  { id: 'q4', question: 'When does my withdrawal arrive?', answer: 'Vendor withdrawals arrive in your linked account within 1–2 business days after a ₦150 processing fee.' },
  { id: 'q5', question: 'How do I tag a product in my post?', answer: 'On the new post screen, tap "Tag product" and search your store or saved items.' },
];

export default function HelpScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Help & support" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSub}>Browse topics or chat with our team</Text>
          </View>
          <Pressable onPress={() => router.push('/messages/support' as never)} style={styles.chatBtn}>
            <Ionicons name="chatbubble-ellipses" size={18} color={palette.ink.onLightStrong} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Topics</Text>
        <View style={styles.grid}>
          {TOPICS.map((t) => (
            <Pressable key={t.key} style={({ pressed }) => [styles.topic, pressed && { opacity: 0.85 }]}>
              <View style={styles.topicIcon}>
                <Ionicons name={t.icon} size={18} color={palette.brand.orange} />
              </View>
              <Text style={styles.topicLabel}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Frequently asked</Text>
        <View style={styles.faqList}>
          {FAQ.map((f) => {
            const open = openId === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setOpenId(open ? null : f.id)}
                style={styles.faqItem}>
                <View style={styles.faqHead}>
                  <Text style={styles.faqQ}>{f.question}</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={palette.ink.onDarkSoft} />
                </View>
                {open ? <Text style={styles.faqA}>{f.answer}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <View style={styles.contactRow}>
            <Pressable style={styles.contactBtn}>
              <Ionicons name="mail-outline" size={18} color={palette.ink.onDarkStrong} />
              <Text style={styles.contactLabel}>Email us</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <Ionicons name="call-outline" size={18} color={palette.ink.onDarkStrong} />
              <Text style={styles.contactLabel}>Call support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: spacing['4'] },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(253,134,22,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(253,134,22,0.40)',
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(253,134,22,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  heroSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    justifyContent: 'space-between',
  },
  topic: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topicIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(253,134,22,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  faqList: { gap: spacing['1'] },
  faqItem: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: spacing['2'],
  },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['2'] },
  faqQ: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  faqA: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: palette.ink.onDarkSoft,
  },
  contact: {
    gap: spacing['3'],
    paddingVertical: spacing['4'],
    alignItems: 'center',
  },
  contactTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  contactRow: { flexDirection: 'row', gap: spacing['3'] },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  contactLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
});
