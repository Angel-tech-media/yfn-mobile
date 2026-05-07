import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { palette, radius, spacing, typography } from '@/src/theme';

const QUICK_TILES: Array<{ key: string; label: string; icon: keyof typeof Ionicons.glyphMap; href: string }> = [
  { key: 'products', label: 'Products', icon: 'pricetags-outline', href: '/vendor-dashboard/products' },
  { key: 'orders', label: 'Orders', icon: 'cube-outline', href: '/orders' },
  { key: 'sales', label: 'Sales', icon: 'stats-chart-outline', href: '/vendor-dashboard/sales' },
  { key: 'store', label: 'My Store', icon: 'storefront-outline', href: '/vendor-store' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SALES_PCTS = [40, 65, 50, 80, 60, 90, 70];
const BUYERS_PCTS = [25, 40, 35, 55, 45, 60, 50];

const RECENT_ORDERS = [
  { id: '#8814564', name: 'Joshua Olamilekan-Ayan', total: '₦67,550', state: 'Pending' },
  { id: '#8814566', name: 'Aisha Bello', total: '₦87,550', state: 'Confirmed' },
  { id: '#8814570', name: 'Tola Adekunle', total: '₦127,000', state: 'Shipped' },
];

const STORIES = [
  { key: 's1', date: 'Today' },
  { key: 's2', date: 'May 6' },
  { key: 's3', date: 'May 4' },
  { key: 's4', date: 'May 2' },
];

export default function VendorDashboardScreen() {
  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.idRow}>
            <Avatar size={36} source={require('@/assets/figma/store-avatar.png')} />
            <View style={styles.nameRow}>
              <Text style={styles.storeName}>Sarah&apos;s Boutique</Text>
              <VerifiedCheck tone="success" size={14} />
            </View>
          </View>
          <Pressable hitSlop={8} style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <View style={styles.deltaBadge}>
                <Ionicons name="trending-up" size={12} color="#1F8E26" />
                <Text style={styles.deltaText}>+3%</Text>
              </View>
            </View>
            <Text style={styles.balanceValue}>₦428,500.00</Text>
            <View style={styles.balanceActions}>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="+ Add Product"
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

          <Pressable onPress={() => router.push('/vendor-dashboard/sales' as never)} style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Sales Analytics</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: palette.brand.orange }]} />
                  <Text style={styles.legendLabel}>Sales</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
                  <Text style={styles.legendLabel}>Buyers</Text>
                </View>
              </View>
            </View>
            <View style={styles.chartWrap}>
              <View style={styles.bars}>
                {DAYS.map((d, i) => (
                  <View key={d + i} style={styles.barCol}>
                    <View style={[styles.bar, { height: `${SALES_PCTS[i]}%`, backgroundColor: palette.brand.orange }]} />
                    <View
                      style={[
                        styles.bar,
                        styles.barOverlay,
                        { height: `${BUYERS_PCTS[i]}%`, backgroundColor: 'rgba(255,255,255,0.55)' },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.daysRow}>
                {DAYS.map((d, i) => (
                  <Text key={d + i} style={styles.dayLabel}>{d}</Text>
                ))}
              </View>
            </View>
          </Pressable>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <Pressable onPress={() => router.push('/orders' as never)}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.recentList}>
              {RECENT_ORDERS.map((o) => (
                <Pressable
                  key={o.id}
                  onPress={() => router.push(`/orders/${o.id.replace('#','')}` as never)}
                  style={styles.recentRow}>
                  <View style={styles.thumb}>
                    <Ionicons name="cube-outline" size={20} color="rgba(255,255,255,0.30)" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.recentId}>{o.id}</Text>
                    <Text style={styles.recentName}>{o.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={styles.recentTotal}>{o.total}</Text>
                    <Text style={styles.recentState}>{o.state}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>My Stories</Text>
              <Pressable>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
              <Pressable style={styles.storyAdd}>
                <Ionicons name="add" size={28} color={palette.ink.onDarkStrong} />
              </Pressable>
              {STORIES.map((s) => (
                <View key={s.key} style={styles.storyCard}>
                  <View style={styles.storyImage}>
                    <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.30)" />
                  </View>
                  <Text style={styles.storyDate}>{s.date}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
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
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scroll: { paddingHorizontal: spacing['5'], paddingBottom: 40, gap: spacing['4'] },
  balanceCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tileLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  sectionCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
  legendRow: { flexDirection: 'row', gap: spacing['3'] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
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
  barOverlay: { opacity: 0.6 },
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
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
  storiesRow: { gap: spacing['2'] },
  storyAdd: {
    width: 84,
    aspectRatio: 0.75,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCard: {
    width: 84,
    aspectRatio: 0.75,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'flex-end',
  },
  storyImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyDate: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
