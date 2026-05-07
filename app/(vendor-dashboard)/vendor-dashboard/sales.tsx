import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

const PERIODS = ['7D', '4W', '3M', '12M'] as const;

const DATA: Record<typeof PERIODS[number], { labels: string[]; sales: number[]; orders: number[] }> = {
  '7D': {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    sales: [40, 65, 50, 80, 60, 90, 70],
    orders: [25, 40, 35, 55, 45, 60, 50],
  },
  '4W': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    sales: [60, 75, 50, 90],
    orders: [42, 48, 36, 55],
  },
  '3M': {
    labels: ['Mar', 'Apr', 'May'],
    sales: [55, 70, 85],
    orders: [40, 50, 65],
  },
  '12M': {
    labels: ['J','F','M','A','M','J','J','A','S','O','N','D'],
    sales: [30, 35, 45, 60, 55, 70, 65, 80, 75, 70, 85, 90],
    orders: [20, 25, 30, 40, 38, 50, 45, 55, 50, 48, 60, 65],
  },
};

const TOP_PRODUCTS = [
  { id: 'p1', name: 'Ankara high shoulder fitted gown', sold: 86, revenue: 2148140 },
  { id: 'p3', name: 'Leopard heeled sandals', sold: 142, revenue: 5466850 },
  { id: 'p4', name: 'Silk floral kimono dress', sold: 64, revenue: 1759680 },
];

export default function SalesAnalyticsScreen() {
  const [period, setPeriod] = useState<typeof PERIODS[number]>('7D');
  const data = DATA[period];

  const totalSales = data.sales.reduce((a, b) => a + b, 0) * 5000;
  const totalOrders = data.orders.reduce((a, b) => a + b, 0);
  const aov = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Sales analytics" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.tabs}>
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.tab, period === p && styles.tabActive]}>
              <Text style={[styles.tabLabel, period === p && styles.tabLabelActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartLabel}>Revenue</Text>
              <Text style={styles.chartValue}>₦{totalSales.toLocaleString()}</Text>
            </View>
            <View style={styles.deltaBadge}>
              <Ionicons name="trending-up" size={12} color="#1F8E26" />
              <Text style={styles.deltaText}>+18%</Text>
            </View>
          </View>

          <View style={styles.bars}>
            {data.labels.map((d, i) => (
              <View key={d + i} style={styles.barCol}>
                <View style={[styles.bar, { height: `${data.sales[i]}%`, backgroundColor: palette.brand.orange }]} />
                <View
                  style={[
                    styles.bar,
                    { height: `${data.orders[i]}%`, backgroundColor: 'rgba(255,255,255,0.55)' },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.daysRow}>
            {data.labels.map((d, i) => (
              <Text key={d + i} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: palette.brand.orange }]} />
              <Text style={styles.legendLabel}>Sales</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.legendLabel}>Orders</Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <KPI label="Orders" value={String(totalOrders)} delta="+12%" />
          <KPI label="AOV" value={`₦${aov.toLocaleString()}`} delta="+5%" />
          <KPI label="Followers" value="1.2K" delta="+3%" />
        </View>

        <Text style={styles.sectionTitle}>Top products</Text>
        <View style={styles.list}>
          {TOP_PRODUCTS.map((p) => (
            <View key={p.id} style={styles.productRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.productSold}>{p.sold} sold</Text>
              </View>
              <Text style={styles.productRevenue}>₦{p.revenue.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function KPI({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiDelta}>{delta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], gap: spacing['3'], paddingBottom: 40 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: palette.bg.surface,
  },
  tabLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  tabLabelActive: { color: palette.ink.onLightStrong },
  chartCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: spacing['3'],
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  chartValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    color: palette.ink.onDarkStrong,
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
  bars: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 4,
  },
  barCol: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  bar: { width: 5, borderRadius: 3 },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 4,
  },
  dayLabel: {
    flex: 1,
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
  },
  legendRow: { flexDirection: 'row', gap: spacing['3'] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  kpiRow: { flexDirection: 'row', gap: spacing['2'] },
  kpi: {
    flex: 1,
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: 2,
  },
  kpiLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  kpiValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 17,
    color: palette.ink.onDarkStrong,
  },
  kpiDelta: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#1F8E26',
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  list: { gap: spacing['2'] },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  productSold: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  productRevenue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.brand.orange,
  },
});
