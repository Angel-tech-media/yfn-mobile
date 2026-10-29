import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Faq = { id: string; question: string; answer: string };

const TOPICS: Array<{ key: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'orders', label: 'Orders & shipping', icon: 'cube-outline' },
  { key: 'returns', label: 'Returns & refunds', icon: 'arrow-undo-outline' },
  { key: 'payments', label: 'Payments & escrow', icon: 'card-outline' },
  { key: 'vendor', label: 'Selling on Vibe', icon: 'storefront-outline' },
  { key: 'account', label: 'Account & security', icon: 'lock-closed-outline' },
  { key: 'content', label: 'Posts, stories & reels', icon: 'sparkles-outline' },
];

const FAQ: Faq[] = [
  { id: 'q1', question: 'How long does delivery take?', answer: 'Most orders arrive in 2–4 business days within Lagos and 4–7 days nationwide.' },
  { id: 'q2', question: 'How do I become a vendor?', answer: 'Tap the "Become a vendor" CTA on your profile. You\'ll be guided through identity verification and store setup in under 10 minutes.' },
  { id: 'q3', question: 'Can I return an item?', answer: 'Yes — most items are eligible for return within 7 days of delivery. Open the order and tap "Request return".' },
  { id: 'q4', question: 'When does my withdrawal arrive?', answer: 'Vendor withdrawals arrive in your linked account within 1–2 business days after standard verification.' },
  { id: 'q5', question: 'How does escrow protection work?', answer: 'When you make a payment on Vibe, your money is securely locked in escrow. Funds are only transferred to the seller once you inspect and confirm receipt of your order.' },
];

export default function HelpScreen() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScreenContainer>
      <TopBar title="Help & Support" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={24} color={palette.brand.gloryBlue} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.heroTitle}>How can we help?</Text>
            <Text style={styles.heroSub}>Browse topics or message support</Text>
          </View>
          <Pressable onPress={() => router.push('/threads' as never)} style={styles.chatBtn}>
            <Ionicons name="chatbubble-ellipses" size={18} color={palette.brand.gloryBlue} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Topics</Text>
        <View style={styles.grid}>
          {TOPICS.map((t) => (
            <Pressable key={t.key} style={({ pressed }) => [styles.topic, pressed && { opacity: 0.85 }]}>
              <View style={styles.topicIcon}>
                <Ionicons name={t.icon} size={18} color={palette.brand.gloryBlue} />
              </View>
              <Text style={styles.topicLabel}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQ.map((f, idx) => {
            const open = openId === f.id;
            return (
              <Pressable
                key={f.id ? `faq-${f.id}-${idx}` : `faq-${idx}`}
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
            <Pressable
              onPress={() => void Linking.openURL('mailto:support@vibe.ng?subject=Vibe%20Support')}
              style={styles.contactBtn}>
              <Ionicons name="mail-outline" size={18} color={palette.brand.gloryBlue} />
              <Text style={styles.contactLabel}>Email Us</Text>
            </Pressable>
            <Pressable
              onPress={() => void Linking.openURL('tel:+2348000008423')}
              style={styles.contactBtn}>
              <Ionicons name="call-outline" size={18} color={palette.brand.gloryBlue} />
              <Text style={styles.contactLabel}>Call Support</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing['4'], paddingBottom: 40, gap: spacing['4'] },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: palette.bg.surface,
    borderWidth: 1,
    borderColor: palette.line.divider,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
    fontWeight: '600',
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
    backgroundColor: palette.bg.surface,
    borderWidth: 1,
    borderColor: palette.line.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
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
    backgroundColor: palette.bg.surface,
    borderWidth: 1,
    borderColor: palette.line.divider,
  },
  topicIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  faqList: { gap: spacing['2'] },
  faqItem: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: palette.bg.surface,
    borderWidth: 1,
    borderColor: palette.line.divider,
    gap: spacing['2'],
  },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['2'] },
  faqQ: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  contactRow: { flexDirection: 'row', gap: spacing['3'] },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.bg.surface,
    borderWidth: 1,
    borderColor: palette.line.divider,
  },
  contactLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
});
