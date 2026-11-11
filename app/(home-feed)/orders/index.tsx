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
import { continuous, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

const FILTERS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Completed'] as const;
type Filter = (typeof FILTERS)[number];

export default function OrdersScreen() {
  const ui = useUi();
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
      <TopBar title="Orders" showBack />

      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? ui.ink : ui.secondary,
                  },
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? ui.inkForeground : ui.secondaryForeground },
                  ]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ui.accent}
            colors={[ui.accent]}
          />
        }>
        {isError ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={32} color={ui.secondaryLabel} />
            <Text style={[styles.emptyTitle, { color: ui.label }]}>Couldn&apos;t load orders</Text>
            <Pressable onPress={() => refetch()} disabled={isFetching}>
              <Text style={[styles.retryText, { color: ui.coral }]}>
                {isFetching ? 'Retrying…' : 'Try again'}
              </Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={32} color={ui.secondaryLabel} />
            <Text style={[styles.emptyTitle, { color: ui.label }]}>Loading orders…</Text>
          </View>
        ) : (
          Array.from(new Map(filteredOrders.map((o) => [o.id, o])).values()).map((o, idx) => (
            <Pressable
              key={o.id ? 'order-' + o.id : 'order-idx-' + idx}
              onPress={() => router.push(`/orders/${o.id}/track` as never)}
              style={[
                styles.card,
                {
                  backgroundColor: ui.card,
                  borderColor: ui.separator,
                },
              ]}>
              <View style={styles.cardHeader}>
                <View style={styles.customerRow}>
                  <Avatar size={36} initials={o.vendor?.[0]?.toUpperCase() || 'A'} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderMeta, { color: ui.secondaryLabel }]}>
                      #{o.id.slice(0, 8)} · {o.vendor}
                    </Text>
                    <Text style={[styles.itemSummary, { color: ui.label }]} numberOfLines={1}>
                      {o.items.map((i) => i.name).join(' · ') || 'Order items'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={ui.secondaryLabel} />
              </View>

              <View style={[styles.footerRow, { borderTopColor: ui.separator }]}>
                <View style={[styles.statusBadge, { backgroundColor: ui.secondary }]}>
                  <Text style={[styles.statusText, { color: ui.accent }]}>
                    {o.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.totalValue, { color: ui.label }]}>
                  {formatKobo(o.grandTotal)}
                </Text>
              </View>

              {o.status === 'paid' ? (
                <PrimaryButton
                  label="Confirm order"
                  size="sm"
                  loading={setStatus.isPending}
                  onPress={() =>
                    setStatus.mutate({
                      id: o.id,
                      input: { status: 'confirmed' },
                    })
                  }
                />
              ) : null}
            </Pressable>
          ))
        )}

        {!isLoading && !isError && filteredOrders.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIconBox, { backgroundColor: ui.secondary }]}>
              <Ionicons name="cube-outline" size={32} color={ui.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: ui.label }]}>No orders yet</Text>
            <Text style={[styles.emptySubtitle, { color: ui.secondaryLabel }]}>
              When you buy something it&apos;ll show here.
            </Text>
            <View style={{ width: '100%', marginTop: 12 }}>
              <PrimaryButton
                label="Start shopping"
                onPress={() => router.replace('/(home-feed)/(tabs)/market' as never)}
              />
            </View>
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
    maxHeight: 50,
    marginBottom: 8,
  },
  chipsRow: {
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  list: {
    paddingBottom: 40,
    gap: 10,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...continuous,
  },
  emptyTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
  },
  emptySubtitle: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 14,
  },
  card: {
    padding: 14,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    ...continuous,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  customerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderMeta: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  itemSummary: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.6,
  },
  totalValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
  },
});
