import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useOrders, useSetOrderStatus } from '@/src/api/orders/hooks';
import type { Order } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Completed'] as const;
type Filter = (typeof FILTERS)[number];

export default function OrdersScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const { data: orders = [], refetch, isFetching, isLoading, isError } = useOrders({ limit: 50 });
  const setStatus = useSetOrderStatus();
  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesFilter(order, activeFilter)),
    [activeFilter, orders],
  );
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

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
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.chip, activeFilter === f && styles.chipActive]}>
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
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
        {isError ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={32} color={palette.ink.onLightSubtle} />
            <Text style={styles.emptyTitle}>Couldn&apos;t load orders</Text>
            <Pressable onPress={() => refetch()} disabled={isFetching}>
              <Text style={styles.retryText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={32} color={palette.ink.onLightSubtle} />
            <Text style={styles.emptyTitle}>Loading orders…</Text>
          </View>
        ) : Array.from(new Map(filteredOrders.map((o) => [o.id, o])).values()).map((o, idx) => {
          return (
            <Pressable
              key={o.id ? 'order-' + o.id : 'order-idx-' + idx}
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
                    o.status === 'shipped' && { backgroundColor: 'rgba(47, 107, 255, 0.18)' },
                  ]}>
                  <Text style={styles.statusPillText}>{o.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.thumbName}>
                {o.items.map((i) => i.name).join(' · ')}
              </Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total · in escrow</Text>
                <Text style={styles.totalValue}>{formatKobo(o.grandTotal)}</Text>
              </View>
              <View style={styles.customerRow}>
                <Avatar size={28} initials={o.vendor[0]} />
                <Text style={styles.customerName}>{o.vendor}</Text>
              </View>
              {o.status === 'paid' ? (
                <View style={styles.actions}>
                  <View style={styles.acceptWrap}>
                    <PrimaryButton
                      label="Accept Order"
                      loading={setStatus.isPending}
                      onPress={() =>
                        setStatus.mutate({
                          id: o.id,
                          input: { status: 'confirmed' },
                        })
                      }
                      style={styles.acceptBtn}
                    />
                  </View>
                </View>
              ) : null}
            </Pressable>
          );
        })}
        {!isLoading && !isError && filteredOrders.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={32} color={palette.ink.onLightSubtle} />
            <Text style={styles.emptyTitle}>
              No orders yet
            </Text>
            <Text style={styles.emptySubtitle}>
              Orders from the backend will appear here once created.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function matchesFilter(order: Order, filter: Filter) {
  if (filter === 'All') return true;
  if (filter === 'Pending') return order.status === 'paid';
  if (filter === 'Confirmed') return order.status === 'confirmed' || order.status === 'packed';
  if (filter === 'Shipped') return order.status === 'shipped';
  return ['delivered', 'released'].includes(order.status);
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
    height: 38,
    minWidth: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
  },
  chipActive: {
    backgroundColor: palette.brand.gloryBlue,
    borderColor: palette.brand.gloryBlue,
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
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    ...typography.title,
    color: palette.ink.onLightStrong,
  },
  emptySubtitle: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    textAlign: 'center',
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
  },
  card: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    gap: spacing['3'],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
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
    backgroundColor: '#1A2244',
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
    borderTopColor: 'rgba(47, 107, 255, 0.16)',
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
    color: palette.brand.gold,
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
    backgroundColor: '#1A2244',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  trackLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
});
