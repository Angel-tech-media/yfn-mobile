import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBadge, type StatusKey } from '@/components/ui/StatusBadge';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

const ITEMS = [
  { id: 'A', name: 'Maxi Sky Blue Gown with Floral', sku: '#8814564', price: '₦25,000', qty: 1 },
  { id: 'B', name: 'Gucci Ladies Hip-toe Shoes', sku: '#8814564', price: '₦135,000', qty: 1 },
  { id: 'C', name: '3pcs Panties Collection', sku: '#8814564', price: '₦45,000', qty: 1 },
];

type Stage = { key: StatusKey; label: string; date: string };

const TIMELINE: Stage[] = [
  { key: 'pending', label: 'Order placed', date: 'May 6, 9:42 AM' },
  { key: 'confirmed', label: 'Confirmed', date: 'May 6, 10:20 AM' },
  { key: 'shipped', label: 'Shipped', date: 'May 7, 8:15 AM' },
  { key: 'completed', label: 'Delivered', date: '—' },
];

export default function OrderDetailScreen() {
  const { id, state } = useLocalSearchParams<{ id: string; state?: StatusKey }>();
  const status: StatusKey = (state ?? 'pending') as StatusKey;

  const stageIndex = TIMELINE.findIndex((t) => t.key === status);

  const showAccept = status === 'pending';
  const showTrack = status === 'shipped' || status === 'confirmed';
  const showRate = status === 'completed';

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Order Details"
        showBack
        rightAction={
          <Pressable hitSlop={8}>
            <Ionicons name="notifications-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.idRow}>
          <View>
            <Text style={styles.idLabel}>Order ID</Text>
            <Text style={styles.idValue}>#{id}</Text>
          </View>
          <StatusBadge status={status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status timeline</Text>
          <View style={styles.timeline}>
            {TIMELINE.map((step, i) => {
              const reached = i <= stageIndex;
              const isCurrent = i === stageIndex;
              return (
                <View key={step.key} style={styles.stage}>
                  <View style={styles.stageRail}>
                    <View
                      style={[
                        styles.stageDot,
                        reached && styles.stageDotReached,
                        isCurrent && styles.stageDotCurrent,
                      ]}>
                      {reached ? <Ionicons name="checkmark" size={11} color="#FFFFFF" /> : null}
                    </View>
                    {i < TIMELINE.length - 1 ? (
                      <View style={[styles.stageLine, reached && styles.stageLineReached]} />
                    ) : null}
                  </View>
                  <View style={styles.stageBody}>
                    <Text style={[styles.stageLabel, !reached && styles.stageLabelMuted]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stageDate}>{step.date}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Info</Text>
          <View style={styles.customerRow}>
            <Avatar size={48} source={require('@/assets/figma/story-1.png')} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.customerName}>Aisha Bello</Text>
              <Text style={styles.customerMeta}>aishabello@email.com</Text>
            </View>
            <Pressable style={styles.chatBtn} hitSlop={8}>
              <Ionicons name="chatbubble-outline" size={16} color={palette.ink.onDarkStrong} />
            </Pressable>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={palette.ink.onDarkSoft} />
            <Text style={styles.metaText}>15 Admiralty Way, Lekki Phase 1</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={16} color={palette.ink.onDarkSoft} />
            <Text style={styles.metaText}>+602 323 4567</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {ITEMS.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Image source={require('@/assets/figma/product-sample.png')} style={styles.itemThumb} contentFit="cover" />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemName} numberOfLines={1}>{it.name}</Text>
                <Text style={styles.itemSku}>{it.sku} · {it.price}</Text>
              </View>
              <Text style={styles.itemQty}>Qty: {it.qty}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <SummaryRow label="Order amount" value="₦205,000" />
          <SummaryRow label="Promo code" value="-₦3,500" tone="negative" />
          <SummaryRow label="Delivery fee" value="₦4,300" />
          <SummaryRow label="Tax" value="₦6,174" />
          <View style={styles.divider} />
          <SummaryRow label="Total Amount" value="₦211,974" emphasized />
        </View>
      </ScrollView>

      {showAccept ? (
        <View style={styles.actions}>
          <Pressable style={styles.rejectBtn} onPress={() => router.back()}>
            <Text style={styles.rejectLabel}>Reject</Text>
          </Pressable>
          <View style={styles.acceptWrap}>
            <PrimaryButton label="Accept Order" onPress={() => router.back()} />
          </View>
        </View>
      ) : showTrack ? (
        <View style={[styles.actions, { flexDirection: 'column', gap: spacing['2'] }]}>
          <PrimaryButton label="Track shipment" onPress={() => router.push(`/orders/${id}/track` as never)} />
        </View>
      ) : showRate ? (
        <View style={[styles.actions, { flexDirection: 'column', gap: spacing['2'] }]}>
          <PrimaryButton label="Leave a review" onPress={() => router.push(`/orders/${id}/review` as never)} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  emphasized,
  tone,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  tone?: 'negative';
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized && styles.summaryLabelStrong]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          emphasized && styles.summaryValueStrong,
          tone === 'negative' && { color: palette.brand.orange },
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: spacing['3'] },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
  },
  idValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: palette.ink.onDarkStrong,
  },
  card: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: spacing['3'],
  },
  cardTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  timeline: { gap: 0 },
  stage: { flexDirection: 'row', gap: spacing['3'] },
  stageRail: { alignItems: 'center', width: 20 },
  stageDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotReached: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
  stageDotCurrent: {
    transform: [{ scale: 1.1 }],
  },
  stageLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 2,
    minHeight: 24,
  },
  stageLineReached: {
    backgroundColor: palette.brand.orange,
  },
  stageBody: { flex: 1, paddingBottom: spacing['3'], gap: 2 },
  stageLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  stageLabelMuted: {
    fontFamily: typography.body.fontFamily,
    color: palette.ink.onDarkMuted,
  },
  stageDate: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  customerName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  customerMeta: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
  },
  chatBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  metaText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  itemName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  itemSku: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkMuted,
  },
  itemQty: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  summary: {
    padding: spacing['4'],
    gap: spacing['2'],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  summaryLabelStrong: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    color: palette.ink.onDarkStrong,
  },
  summaryValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  summaryValueStrong: {
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.20)',
    marginVertical: spacing['2'],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
  },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,67,54,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.40)',
  },
  rejectLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: '#FF6A55',
  },
  acceptWrap: { flex: 1 },
});
