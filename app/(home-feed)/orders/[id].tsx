import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PLATFORM_FEE_LABEL } from '@/src/config/fees';
import { useConfirmOrder, useOrder } from '@/src/api/orders/hooks';
import { useStartConversation } from '@/src/api/chat/hooks';
import type { OrderStatus } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const PRODUCT = require('@/assets/figma/product-sample.png');

const STAGES: Array<{ key: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'paid', label: 'Paid · held in escrow', icon: 'lock-closed' },
  { key: 'confirmed', label: 'Vendor confirmed', icon: 'checkmark-circle' },
  { key: 'packed', label: 'Packed', icon: 'cube' },
  { key: 'shipped', label: 'In transit', icon: 'navigate' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
  { key: 'released', label: 'Released to vendor', icon: 'checkmark-done' },
];

const STATUS_TO_STAGE_INDEX: Partial<Record<OrderStatus, number>> = {
  paid: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
  released: 5,
};

const ORDER_STATUSES = [
  'paid',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'released',
  'refunded',
  'disputed',
] as const satisfies readonly OrderStatus[];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = String(id ?? '');
  const { data: order, isLoading, isError, refetch, isFetching } = useOrder(orderId);
  const confirmOrder = useConfirmOrder();
  const startConversation = useStartConversation();
  const currentStatus = asOrderStatus(order?.status) ?? 'paid';
  const currentIdx = STATUS_TO_STAGE_INDEX[currentStatus] ?? 0;
  const shipTo = useMemo(() => (order ? formatShipTo(order.shipTo) : ''), [order]);
  const shipPhone = useMemo(() => (order ? formatShipPhone(order.shipTo, order.shipPhone) : ''), [order]);

  const confirmDelivery = () => {
    if (!order) return;
    confirmOrder.mutate(order.id);
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onLightStrong} />
          </Pressable>
          <Text style={styles.title}>Order #{orderId}</Text>
          <Pressable hitSlop={8} accessibilityLabel="More">
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={palette.ink.onLightStrong}
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          {isLoading ? (
            <View style={styles.center}>
              <Text style={styles.centerText}>Loading order…</Text>
            </View>
          ) : isError || !order ? (
            <View style={styles.center}>
              <Text style={styles.centerText}>Couldn&apos;t load this order.</Text>
              <Pressable onPress={() => refetch()} disabled={isFetching}>
                <Text style={styles.retryText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
              </Pressable>
            </View>
          ) : (
          <>
          {/* Status hero */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusKicker}>
                {statusHeadline(order.status)}
              </Text>
              <Text style={styles.statusEta}>{order.estimatedDelivery ?? statusLabel(order.status)}</Text>
            </View>
            <Pressable
              onPress={() => router.push(`/orders/${order.id}/track` as never)}
              style={styles.trackBtn}>
              <Ionicons name="map-outline" size={14} color={palette.brand.orange} />
              <Text style={styles.trackLabel}>Open live tracking</Text>
            </Pressable>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            {STAGES.map((s, i) => {
              const reached = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <View key={s.key} style={styles.stageRow}>
                  <View
                    style={[
                      styles.stageDot,
                      reached && styles.stageDotOn,
                      active && styles.stageDotActive,
                    ]}>
                    {reached ? (
                      <Ionicons name={s.icon} size={12} color="#fff" />
                    ) : null}
                  </View>
                  {i < STAGES.length - 1 ? (
                    <View
                      style={[styles.stageLine, reached && styles.stageLineOn]}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.stageLabel,
                      active && styles.stageLabelActive,
                      !reached && { color: palette.ink.onLightSubtle },
                    ]}>
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Vendor */}
          <Pressable
            onPress={() => router.push(`/u/${order.vendorHandle}` as never)}
            style={styles.vendorCard}>
            <Avatar size={44} initials={order.vendor[0]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorName}>{order.vendor}</Text>
              <Text style={styles.vendorMeta}>@{order.vendorHandle}</Text>
            </View>
            <Pressable
              disabled={startConversation.isPending}
              onPress={() =>
                startConversation.mutate(
                  { participantUserId: order.vendorUserId, orderId: order.id },
                  { onSuccess: (conversation) => router.push(`/threads/${conversation.id}` as never) },
                )
              }
              style={styles.msgBtn}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={palette.brand.orange}
              />
            </Pressable>
          </Pressable>

          {/* Referrer attribution — repost-as-referral */}
          {order.referrerHandle ? (
            <Pressable
              onPress={() => router.push(`/u/${order.referrerHandle}` as never)}
              style={styles.referrerCard}>
              <Ionicons name="repeat" size={14} color={palette.brand.orange} />
              <Text style={styles.referrerText}>
                Reached via{' '}
                <Text style={styles.referrerHandle}>@{order.referrerHandle}</Text>
                &apos;s repost.
              </Text>
              <Ionicons name="chevron-forward" size={14} color={palette.ink.onLightSubtle} />
            </Pressable>
          ) : null}

          {/* Items */}
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((it, i) => (
            <View key={i} style={styles.itemRow}>
              <Image
                source={it.imageUrl ? { uri: it.imageUrl } : PRODUCT}
                style={styles.itemImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {it.name}
                </Text>
                <Text style={styles.itemMeta}>Qty {it.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatKobo(it.qty * it.unit)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatKobo(order.goodsTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery fee</Text>
              <Text style={styles.totalValue}>
                {order.deliveryFee === 0 ? 'Free' : formatKobo(order.deliveryFee)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{PLATFORM_FEE_LABEL}</Text>
              <Text style={styles.totalValue}>{formatKobo(order.platformFee)}</Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelStrong}>Total · in escrow</Text>
              <Text style={styles.totalValueStrong}>{formatKobo(order.grandTotal)}</Text>
            </View>
          </View>

          {/* Shipping */}
          <Text style={styles.sectionTitle}>Shipping</Text>
          <View style={styles.shipCard}>
            <View style={styles.shipRow}>
              <Ionicons name="location-outline" size={16} color={palette.brand.orange} />
              <Text style={styles.shipText}>{shipTo || 'No shipping address on this order'}</Text>
            </View>
            <View style={styles.shipRow}>
              <Ionicons name="call-outline" size={16} color={palette.brand.orange} />
              <Text style={styles.shipText}>{shipPhone || '—'}</Text>
            </View>
            <View style={styles.shipRow}>
              <Ionicons name="time-outline" size={16} color={palette.brand.orange} />
              <Text style={styles.shipText}>Placed {formatWhen(order.placedAt)}</Text>
            </View>
          </View>

          {/* Actions */}
          {order.status === 'released' ? (
            <Pressable
              onPress={() => router.push(`/orders/${order.id}/review` as never)}
              style={[styles.primaryBtn, { backgroundColor: palette.brand.orange }]}>
              <Ionicons name="star-outline" size={16} color="#fff" />
              <Text style={styles.primaryLabel}>Leave a review</Text>
            </Pressable>
          ) : order.status === 'shipped' || order.status === 'delivered' ? (
            <Pressable
              onPress={confirmDelivery}
              disabled={confirmOrder.isPending}
              style={[styles.primaryBtn, { backgroundColor: palette.status.success }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.primaryLabel}>
                {confirmOrder.isPending
                  ? 'Releasing to vendor…'
                  : 'Confirm delivery (releases escrow)'}
              </Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.primaryBtn, { backgroundColor: palette.brand.orange }]}>
              <Ionicons name="navigate-outline" size={16} color="#fff" />
              <Text style={styles.primaryLabel}>Track shipment</Text>
            </Pressable>
          )}

          <Pressable style={styles.secondaryBtn}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={palette.status.danger}
            />
            <Text style={styles.secondaryLabel}>Report a problem</Text>
          </Pressable>

          <View style={{ height: 40 }} />
          </>
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function asOrderStatus(status: string | undefined): OrderStatus | undefined {
  return ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
}

function statusHeadline(status: string) {
  if (status === 'released') return 'Order complete';
  if (status === 'delivered') return 'Awaiting payout';
  if (status === 'shipped') return 'On its way';
  if (status === 'confirmed') return 'Vendor confirmed';
  if (status === 'packed') return 'Packed';
  if (status === 'disputed') return 'Disputed';
  if (status === 'refunded') return 'Refunded';
  return 'Paid · held in escrow';
}

function statusLabel(status: string) {
  const known = asOrderStatus(status);
  const stage = known ? STAGES.find((item) => item.key === known) : undefined;
  return stage?.label ?? statusHeadline(status);
}

function formatShipTo(shipTo: unknown) {
  if (!shipTo) return '';
  if (typeof shipTo === 'string') return shipTo;
  const address = shipTo as { street?: string; city?: string; state?: string };
  return [address.street, address.city, address.state].filter(Boolean).join(', ');
}

function formatShipPhone(shipTo: unknown, shipPhone?: string) {
  if (shipPhone) return shipPhone;
  if (shipTo && typeof shipTo === 'object' && 'phone' in shipTo) {
    return String((shipTo as { phone?: string }).phone ?? '');
  }
  return '';
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyEmphasis,
    fontSize: 15,
    color: palette.ink.onLightStrong,
  },
  scroll: { paddingHorizontal: spacing['4'], paddingBottom: 40 },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['8'],
    gap: spacing['2'],
  },
  centerText: {
    ...typography.body,
    color: palette.ink.onLightStrong,
    textAlign: 'center',
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
  },
  statusCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(40, 26, 16, 0.18)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusKicker: {
    ...typography.title,
    color: palette.ink.onLightStrong,
  },
  statusEta: {
    ...typography.caption,
    color: palette.brand.orangeDeep,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing['3'],
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(47, 107, 255, 0.14)',
  },
  trackLabel: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.brand.orange,
  },
  section: { marginTop: spacing['5'] },
  sectionTitle: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
    marginTop: spacing['4'],
    marginBottom: spacing['3'],
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: 8,
  },
  stageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotOn: { backgroundColor: palette.brand.orange },
  stageDotActive: {
    backgroundColor: palette.brand.orange,
    shadowColor: palette.brand.orange,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  stageLine: {
    position: 'absolute',
    left: 10,
    top: 28,
    width: 2,
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
  },
  stageLineOn: { backgroundColor: palette.brand.orange },
  stageLabel: {
    ...typography.body,
    color: palette.ink.onLightStrong,
  },
  stageLabelActive: {
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    marginTop: spacing['3'],
  },
  vendorAvatar: { width: 44, height: 44, borderRadius: 22 },
  vendorName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  vendorMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 2,
  },
  msgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(47, 107, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.28)',
    marginTop: spacing['2'],
  },
  referrerText: {
    flex: 1,
    ...typography.caption,
    color: palette.ink.onLightStrong,
    lineHeight: 17,
  },
  referrerHandle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    color: palette.brand.orangeDeep,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  itemName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  itemMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 2,
  },
  itemPrice: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  totals: {
    marginTop: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    gap: spacing['1'],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
  },
  totalValue: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  totalDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 4,
  },
  totalLabelStrong: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  totalValueStrong: {
    ...typography.h2,
    fontSize: 18,
    color: palette.brand.orangeDeep,
  },
  shipCard: {
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    gap: spacing['2'],
  },
  shipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shipText: { ...typography.body, color: palette.ink.onLightStrong, flex: 1 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing['5'],
    height: 52,
    borderRadius: 999,
  },
  primaryLabel: {
    ...typography.bodyEmphasis,
    color: '#fff',
    fontSize: 15,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing['3'],
    paddingVertical: 12,
  },
  secondaryLabel: {
    ...typography.caption,
    color: palette.status.danger,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});
