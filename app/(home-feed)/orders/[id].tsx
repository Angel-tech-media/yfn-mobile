import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useOrders } from '@/src/store/orders';
import { useWallet } from '@/src/store/wallet';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT = require('@/assets/figma/product-sample.png');
const STORE = require('@/assets/figma/store-avatar.png');

type Stage = 'paid' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'released';
type Status = 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'released';

type OrderData = {
  id: string;
  vendor: string;
  vendorHandle: string;
  items: Array<{ name: string; qty: number; unit: number; image: any }>;
  status: Status;
  placedAt: string;
  estimatedDelivery: string;
  shipTo: string;
  shipPhone: string;
  referrerHandle?: string;
};

const ORDERS: Record<string, OrderData> = {
  'ord-1': {
    id: 'ord-1',
    vendor: 'Aisha Threads',
    vendorHandle: 'aishathreads',
    items: [
      { name: 'Ankara A-line Dress', qty: 1, unit: 18500, image: PRODUCT },
    ],
    status: 'shipped',
    placedAt: 'May 6 · 9:42 AM',
    estimatedDelivery: 'Today by 6:00 PM',
    shipTo: '12 Adeola Odeku, Victoria Island, Lagos',
    shipPhone: '+234 803 555 0142',
  },
  'ord-2': {
    id: 'ord-2',
    vendor: 'GadgetFix Hub',
    vendorHandle: 'gadgetfix',
    items: [{ name: 'iPhone screen replacement', qty: 1, unit: 9200, image: PRODUCT }],
    status: 'released',
    placedAt: 'May 4 · 2:14 PM',
    estimatedDelivery: 'Delivered May 5',
    shipTo: 'Walk-in · VI repair studio',
    shipPhone: '+234 802 555 0801',
  },
  'ord-3': {
    id: 'ord-3',
    vendor: 'Zara Cakes',
    vendorHandle: 'zaracakes',
    items: [{ name: 'Three-tier celebration cake', qty: 1, unit: 4500, image: PRODUCT }],
    status: 'delivered',
    placedAt: 'May 1 · 11:02 AM',
    estimatedDelivery: 'Delivered May 3',
    shipTo: '8 Marwa Rd, Lekki Phase 1',
    shipPhone: '+234 815 555 0140',
  },
};

const FALLBACK: OrderData = {
  id: 'ord-x',
  vendor: 'Vendor',
  vendorHandle: 'vendor',
  items: [{ name: 'Product', qty: 1, unit: 0, image: PRODUCT }],
  status: 'paid',
  placedAt: 'just now',
  estimatedDelivery: 'TBC',
  shipTo: 'Lagos',
  shipPhone: '',
};

const STAGES: Array<{ key: Stage; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'paid', label: 'Paid · held in escrow', icon: 'lock-closed' },
  { key: 'confirmed', label: 'Vendor confirmed', icon: 'checkmark-circle' },
  { key: 'packed', label: 'Packed', icon: 'cube' },
  { key: 'shipped', label: 'In transit', icon: 'navigate' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
  { key: 'released', label: 'Released to vendor', icon: 'checkmark-done' },
];

const STATUS_TO_STAGE_INDEX: Record<Status, number> = {
  paid: 0,
  confirmed: 1,
  shipped: 3,
  delivered: 4,
  released: 5,
};

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG');

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placedOrder = useOrders((s) => s.orders.find((o) => o.id === String(id)));
  const order: OrderData = placedOrder
    ? {
        id: placedOrder.id,
        vendor: placedOrder.vendor,
        vendorHandle: placedOrder.vendorHandle,
        items: placedOrder.items.map((it) => ({ ...it, image: PRODUCT })),
        status: placedOrder.status === 'confirmed' ? 'confirmed' : placedOrder.status,
        placedAt: new Date(placedOrder.placedAt).toLocaleString('en-NG', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        estimatedDelivery: 'Today by 6:00 PM',
        shipTo: '12 Adeola Odeku, Victoria Island, Lagos',
        shipPhone: '+234 803 555 0142',
        referrerHandle: placedOrder.referrerHandle,
      }
    : ORDERS[String(id ?? 'ord-1')] ?? { ...FALLBACK, id: String(id) };
  const [status, setStatus] = useState<Status>(order.status);
  const releaseFromEscrow = useWallet((s) => s.releaseFromEscrow);

  const subtotal = order.items.reduce((a, i) => a + i.qty * i.unit, 0);
  const deliveryFee = order.status === 'released' ? 0 : 1500;
  const total = subtotal + deliveryFee;

  const currentIdx = STATUS_TO_STAGE_INDEX[status];

  const confirmDelivery = () => {
    setStatus('delivered');
    setTimeout(() => {
      releaseFromEscrow({
        amount: subtotal,
        orderId: order.id,
        vendor: order.vendor,
      });
      setStatus('released');
    }, 600);
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onLightStrong} />
          </Pressable>
          <Text style={styles.title}>Order #{order.id}</Text>
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
          {/* Status hero */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusKicker}>
                {status === 'released'
                  ? 'Order complete'
                  : status === 'delivered'
                  ? 'Awaiting payout'
                  : status === 'shipped'
                  ? 'On its way'
                  : status === 'confirmed'
                  ? 'Vendor confirmed'
                  : 'Paid · held in escrow'}
              </Text>
              <Text style={styles.statusEta}>{order.estimatedDelivery}</Text>
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
            <Image source={STORE} style={styles.vendorAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorName}>{order.vendor}</Text>
              <Text style={styles.vendorMeta}>NIN-verified · DM open</Text>
            </View>
            <Pressable
              onPress={() => router.push(`/messages/${order.vendorHandle}` as never)}
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
                's repost — they earn ₦50 on this order.
              </Text>
              <Ionicons name="chevron-forward" size={14} color={palette.ink.onLightSubtle} />
            </Pressable>
          ) : null}

          {/* Items */}
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((it, i) => (
            <View key={i} style={styles.itemRow}>
              <Image source={it.image} style={styles.itemImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {it.name}
                </Text>
                <Text style={styles.itemMeta}>Qty {it.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>{fmt(it.qty * it.unit)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery fee</Text>
              <Text style={styles.totalValue}>
                {deliveryFee === 0 ? 'Free' : fmt(deliveryFee)}
              </Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelStrong}>Total · in escrow</Text>
              <Text style={styles.totalValueStrong}>{fmt(total)}</Text>
            </View>
          </View>

          {/* Shipping */}
          <Text style={styles.sectionTitle}>Shipping</Text>
          <View style={styles.shipCard}>
            <View style={styles.shipRow}>
              <Ionicons name="location-outline" size={16} color={palette.brand.orange} />
              <Text style={styles.shipText}>{order.shipTo}</Text>
            </View>
            <View style={styles.shipRow}>
              <Ionicons name="call-outline" size={16} color={palette.brand.orange} />
              <Text style={styles.shipText}>{order.shipPhone || '—'}</Text>
            </View>
            <View style={styles.shipRow}>
              <Ionicons name="time-outline" size={16} color={palette.brand.orange} />
              <Text style={styles.shipText}>Placed {order.placedAt}</Text>
            </View>
          </View>

          {/* Actions */}
          {status === 'released' ? (
            <Pressable
              onPress={() => router.push(`/orders/${order.id}/review` as never)}
              style={[styles.primaryBtn, { backgroundColor: palette.brand.orange }]}>
              <Ionicons name="star-outline" size={16} color="#fff" />
              <Text style={styles.primaryLabel}>Leave a review</Text>
            </Pressable>
          ) : status === 'shipped' || status === 'delivered' ? (
            <Pressable
              onPress={confirmDelivery}
              style={[styles.primaryBtn, { backgroundColor: palette.status.success }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.primaryLabel}>
                {status === 'delivered'
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
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
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
  statusCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    backgroundColor: 'rgba(216, 149, 68, 0.14)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    backgroundColor: 'rgba(216, 149, 68, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referrerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(216, 149, 68, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68, 0.28)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
