import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Image } from 'expo-image';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Completed'];

const PRODUCT = require('@/assets/figma/product-sample.png');
const AVATAR1 = require('@/assets/figma/story-1.png');
const AVATAR2 = require('@/assets/figma/story-2.png');

const ORDERS = [
  {
    id: '#8814564',
    state: 'pending' as const,
    statusKey: 'pending' as const,
    items: ['Maxi Sky Blue Gown', 'Gucci Hip-toe Shoes', '3pcs Panties Collection'],
    total: '₦67,550',
    customer: 'Aisha Bello',
    avatar: AVATAR1,
  },
  {
    id: '#8814566',
    state: 'in_progress' as const,
    statusKey: 'shipped' as const,
    items: ["Men's Joriexx Kaftan", 'VOOON jacket skirt'],
    total: '₦87,550',
    customer: 'Joshua Olamilekan-Ayan',
    avatar: AVATAR2,
  },
];

export default function OrdersScreen() {
  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Orders"
        showBack
        rightAction={
          <Pressable hitSlop={8}>
            <Ionicons name="search" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {FILTERS.map((f, idx) => (
          <Pressable key={f} style={[styles.chip, idx === 0 && styles.chipActive]}>
            <Text style={[styles.chipText, idx === 0 && styles.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {ORDERS.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => router.push(`/orders/${o.id.replace('#', '')}?state=${o.statusKey}` as never)}
            style={styles.card}>
            <Text style={styles.orderId}>{o.id}</Text>

            <View style={styles.thumbRow}>
              {o.items.map((it, i) => (
                <View key={i} style={styles.thumbItem}>
                  <Image source={PRODUCT} style={styles.thumb} contentFit="cover" />
                  <Text style={styles.thumbName} numberOfLines={1}>{it}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{o.total}</Text>
            </View>

            <View style={styles.customerRow}>
              <Avatar size={28} source={o.avatar} />
              <Text style={styles.customerName}>{o.customer}</Text>
            </View>

            {o.state === 'pending' ? (
              <View style={styles.actions}>
                <Pressable style={styles.rejectBtn}>
                  <Text style={styles.rejectLabel}>Reject</Text>
                </Pressable>
                <View style={styles.acceptWrap}>
                  <PrimaryButton label="Accept Order" onPress={() => {}} style={styles.acceptBtn} />
                </View>
              </View>
            ) : (
              <Pressable style={styles.trackBtn}>
                <Text style={styles.trackLabel}>Track shipment</Text>
              </Pressable>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    paddingVertical: spacing['3'],
    gap: spacing['2'],
  },
  chip: {
    paddingHorizontal: spacing['4'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chipActive: {
    backgroundColor: palette.bg.surface,
    borderColor: palette.bg.surface,
  },
  chipText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  chipTextActive: {
    color: palette.ink.onLightStrong,
  },
  list: {
    paddingBottom: 40,
    gap: spacing['3'],
  },
  card: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: spacing['3'],
  },
  orderId: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  thumbRow: {
    gap: spacing['2'],
  },
  thumbItem: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  thumbName: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing['2'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  totalLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
  },
  totalValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  customerName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  rejectBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,67,54,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.40)',
  },
  rejectLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: '#FF6A55',
  },
  acceptWrap: { flex: 1 },
  acceptBtn: {
    height: 44,
  },
  trackBtn: {
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  trackLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
});
