import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useMe } from '@/src/api/account/hooks';
import { useConversations } from '@/src/api/chat/hooks';
import { useOrders } from '@/src/api/orders/hooks';
import { useVendor, useUpdateLocationSettings } from '@/src/api/vendors/hooks';
import { useWallet } from '@/src/api/wallet/hooks';
import { vibeHaptics } from '@/src/lib/haptics';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const QUICK_TILES: Array<{ key: string; label: string; icon: keyof typeof Ionicons.glyphMap; href: string }> = [
  { key: 'products', label: 'Products', icon: 'pricetags-outline', href: '/vendor-dashboard/products' },
  { key: 'orders', label: 'Orders', icon: 'cube-outline', href: '/orders' },
  { key: 'sales', label: 'Sales', icon: 'stats-chart-outline', href: '/vendor-dashboard/sales' },
  { key: 'store', label: 'Store', icon: 'storefront-outline', href: '/vendor-store' },
];

export default function VendorDashboardScreen() {
  const { data: me } = useMe();
  const { data: vendor } = useVendor(me?.handle || me?.username);
  const updateLocation = useUpdateLocationSettings();

  const [showOnMap, setShowOnMap] = useState<boolean | null>(null);
  const [showExactLocation, setShowExactLocation] = useState<boolean | null>(null);

  const effectiveShowOnMap = showOnMap !== null ? showOnMap : (vendor?.showOnMap ?? true);
  const effectiveShowExactLocation = showExactLocation !== null ? showExactLocation : (vendor?.showExactLocation ?? true);

  const handleToggleShowOnMap = (val: boolean) => {
    setShowOnMap(val);
    vibeHaptics.selection();
    updateLocation.mutate({ showOnMap: val });
  };

  const handleToggleShowExactLocation = (val: boolean) => {
    setShowExactLocation(val);
    vibeHaptics.selection();
    updateLocation.mutate({ showExactLocation: val });
  };

  const { data: wallet } = useWallet();
  const { data: orders = [] } = useOrders({ role: 'vendor', limit: 20 });
  const chart = buildOrderChart(orders);
  const maxDayTotal = Math.max(...chart.map((day) => day.total), 1);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.idRow}>
            <Avatar size={36} source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined} initials={(me?.name ?? 'Vendor')[0]} />
            <View style={styles.nameRow}>
              <Text style={styles.storeName}>{me?.name ?? 'Vendor dashboard'}</Text>
              {me?.kycVerified ? <VerifiedCheck tone="success" size={14} /> : null}
            </View>
          </View>
          <Pressable hitSlop={8} style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>Available balance</Text>
            </View>
            <Text style={styles.balanceValue}>{formatKobo(wallet?.balance ?? 0)}</Text>
            <View style={styles.balanceActions}>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="Add product"
                  onPress={() => router.push('/products/add' as never)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="Withdraw"
                  variant="ghost"
                  onPress={() => router.push('/vendor-dashboard/withdraw' as never)}
                />
              </View>
            </View>
          </View>

          <View style={styles.tilesRow}>
            {QUICK_TILES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => router.push(t.href as never)}
                style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}>
                <View style={styles.tileIcon}>
                  <Ionicons name={t.icon} size={20} color={palette.ink.onDarkStrong} />
                </View>
                <Text style={styles.tileLabel}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Store visibility */}
          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Store visibility</Text>

            <View style={styles.privacyRow}>
              <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
                <Text style={styles.privacyRowTitle}>Show on map</Text>
                <Text style={styles.privacyRowDesc}>
                  {effectiveShowOnMap ? 'Buyers nearby can find your store.' : 'Hidden. Buyers reach you by link or handle only.'}
                </Text>
              </View>
              <Switch
                value={effectiveShowOnMap}
                onValueChange={handleToggleShowOnMap}
                trackColor={{ false: 'rgba(245,241,234,0.16)', true: '#E85D3F' }}
                thumbColor="#F5F1EA"
              />
            </View>

            <View style={styles.privacyDivider} />

            <View style={styles.privacyRow}>
              <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
                <Text style={styles.privacyRowTitle}>Approximate location</Text>
                <Text style={styles.privacyRowDesc}>
                  {!effectiveShowExactLocation ? 'Buyers see your area, not your exact address.' : 'Buyers see your exact address.'}
                </Text>
              </View>
              <Switch
                value={!effectiveShowExactLocation}
                onValueChange={(masked) => handleToggleShowExactLocation(!masked)}
                trackColor={{ false: 'rgba(245,241,234,0.16)', true: '#E85D3F' }}
                thumbColor="#F5F1EA"
              />
            </View>
          </View>

          <Pressable onPress={() => router.push('/vendor-dashboard/sales' as never)} style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Sales, last 7 days</Text>
            </View>
            <View style={styles.chartWrap}>
              <View style={styles.bars}>
                {chart.map((d) => (
                  <View key={`bar-${d.key}`} style={styles.barCol}>
                    <View style={[styles.bar, { height: `${Math.max(8, (d.total / maxDayTotal) * 100)}%`, backgroundColor: palette.brand.orange }]} />
                  </View>
                ))}
              </View>
              <View style={styles.daysRow}>
                {chart.map((d) => (
                  <Text key={`day-${d.key}`} style={styles.dayLabel}>{d.label}</Text>
                ))}
              </View>
            </View>
          </Pressable>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Recent orders</Text>
              <Pressable onPress={() => router.push('/orders' as never)}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.recentList}>
              {orders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No recent orders yet.</Text>
                </View>
              ) : orders.slice(0, 3).map((o, idx) => (
                <Pressable
                  key={o.id ? `order-${o.id}-${idx}` : `order-${idx}`}
                  onPress={() => router.push(`/orders/${o.id}` as never)}
                  style={styles.recentRow}>
                  <View style={styles.thumb}>
                    <Ionicons name="cube-outline" size={20} color="rgba(255,255,255,0.30)" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.recentId}>#{o.id}</Text>
                    <Text style={styles.recentName}>{o.items.map((item) => item.name).join(' · ')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={styles.recentTotal}>{formatKobo(o.grandTotal)}</Text>
                    <Text style={styles.recentState}>{o.status}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function buildOrderChart(orders: { placedAt: string; grandTotal: number }[]) {
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-NG', { weekday: 'short' }).slice(0, 1),
      total: 0,
      count: 0,
    };
  });
  for (const order of orders) {
    const key = new Date(order.placedAt).toISOString().slice(0, 10);
    const day = days.find((item) => item.key === key);
    if (day) {
      day.total += order.grandTotal;
      day.count += 1;
    }
  }
  return days;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
  },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  storeName: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    color: palette.ink.onDarkStrong,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 93, 63, 0.12)',
  },
  scroll: { paddingHorizontal: spacing['5'], paddingBottom: 40, gap: spacing['4'] },
  balanceCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing['3'],
  },
  balanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(76,175,80,0.16)',
  },
  deltaText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#1F8E26',
  },
  balanceValue: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 30,
    lineHeight: 36,
    color: palette.ink.onDarkStrong,
  },
  balanceActions: { flexDirection: 'row', gap: spacing['2'] },
  tilesRow: { flexDirection: 'row', gap: spacing['2'], justifyContent: 'space-between' },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['1'],
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232, 93, 63, 0.12)',
  },
  tileLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  sectionCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing['3'],
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  chartWrap: { gap: 6 },
  bars: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  barCol: {
    width: 18,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  bar: { width: 6, borderRadius: 3 },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    width: 18,
    textAlign: 'center',
  },
  section: { gap: spacing['3'] },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  recentList: { gap: spacing['2'] },
  emptyState: {
    padding: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(32, 32, 39, 0.86)',
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(232, 93, 63, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentId: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  recentName: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  recentTotal: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  recentState: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
  },
  privacyCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing['3'],
  },
  privacyTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  privacyDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyRowTitle: {
    ...typography.bodyEmphasis,
    color: '#FFFFFF',
    fontSize: 13,
  },
  privacyRowDesc: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    lineHeight: 16,
  },
});
