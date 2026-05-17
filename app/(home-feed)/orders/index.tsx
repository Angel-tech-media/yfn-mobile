import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Image } from 'expo-image';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useOrders } from '@/src/store/orders';
import { palette, radius, spacing, typography } from '@/src/theme';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Completed'];

const fmtNgn = (n: number) => '₦' + n.toLocaleString('en-NG');

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
  const liveOrders = useOrders((s) => s.orders);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

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

      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {FILTERS.map((f, idx) => (
            <Pressable key={f} style={[styles.chip, idx === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, idx === 0 && styles.chipTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.brand.orange}
            colors={[palette.brand.orange]}
          />
        }>
        {liveOrders.map((o) => {
          const total = o.items.reduce((a, i) => a + i.qty * i.unit, 0);
          return (
            <Pressable
              key={o.id}
              onPress={() => router.push(`/orders/${o.id}` as never)}
              style={styles.card}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.orderId}>#{o.id}</Text>
                <View
                  style={[
                    styles.statusPill,
                    o.status === 'released' && { backgroundColor: 'rgba(76,175,80,0.18)' },
                    o.status === 'shipped' && { backgroundColor: 'rgba(216, 149, 68, 0.18)' },
                  ]}>
                  <Text style={styles.statusPillText}>{o.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.thumbName}>
                {o.items.map((i) => i.name).join(' · ')}
              </Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total · in escrow</Text>
                <Text style={styles.totalValue}>{fmtNgn(total)}</Text>
              </View>
              <View style={styles.customerRow}>
                <Avatar size={28} initials={o.vendor[0]} />
                <Text style={styles.customerName}>{o.vendor}</Text>
              </View>
            </Pressable>
          );
        })}
        {liveOrders.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
            <Ionicons name="cube-outline" size={32} color={palette.ink.onLightSubtle} />
            <Text style={{ ...typography.title, color: palette.ink.onLightStrong }}>
              No orders yet
            </Text>
            <Text style={{ ...typography.body, color: palette.ink.onLightSubtle, textAlign: 'center' }}>
              Buy something from a product page and it'll show up here.
            </Text>
          </View>
        ) : null}
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
  chipsWrap: {
    maxHeight: 56,
    marginBottom: spacing['2'],
  },
  chipsRow: {
    paddingVertical: spacing['2'],
    paddingRight: spacing['4'],
    gap: spacing['2'],
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing['4'],
    height: 36,
    minWidth: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipActive: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
  chipText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onLightStrong,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingBottom: 40,
    gap: spacing['3'],
  },
  card: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    gap: spacing['3'],
    shadowColor: 'rgba(40, 26, 16, 0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 4,
  },
  orderId: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  statusPill: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(91, 168, 232, 0.22)',
    justifyContent: 'center',
  },
  statusPillText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 9,
    letterSpacing: 0.6,
    color: palette.ink.onLightStrong,
  },
  thumbRow: {
    gap: spacing['2'],
  },
  thumbItem: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  trackLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
});
