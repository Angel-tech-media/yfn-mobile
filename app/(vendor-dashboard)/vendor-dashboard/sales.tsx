import { useMemo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useOrders } from '@/src/api/orders/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';

import { formatKobo } from '@/src/utils/money';

import type { Order } from '@/src/api/types';

const PERIODS = ['7D', '4W', '3M', '12M'] as const;

type Period = typeof PERIODS[number];

type Bucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
  total: number;
  count: number;
};

type ProductMetric = {
  key: string;
  name: string;
  sold: number;
  revenue: number;
};

export default function SalesAnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('7D');
  const { data: orders = [], isError, isFetching, refetch } = useOrders({ role: 'vendor', limit: 100 });

  const analytics = useMemo(() => buildAnalytics(orders, period), [orders, period]);
  const maxRevenue = Math.max(...analytics.buckets.map((bucket) => bucket.total), 1);
  const maxOrders = Math.max(...analytics.buckets.map((bucket) => bucket.count), 1);
  const aov = analytics.orderCount > 0 ? Math.round(analytics.totalRevenue / analytics.orderCount) : 0;
  const hasSales = analytics.orderCount > 0;

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

        {isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Could not load sales data.</Text>
            <Pressable onPress={() => refetch()} disabled={isFetching}>
              <Text style={styles.retryText}>{isFetching ? 'Retrying...' : 'Try again'}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartLabel}>Revenue</Text>
              <Text style={styles.chartValue}>{formatKobo(analytics.totalRevenue)}</Text>
            </View>
            <View style={styles.chartMeta}>
              <Ionicons name="time-outline" size={12} color={palette.ink.onDarkMuted} />
              <Text style={styles.chartMetaText}>{periodLabel(period)}</Text>
            </View>
          </View>

          {hasSales ? (
            <>
              <View style={styles.bars}>
                {analytics.buckets.map((bucket) => (
                  <View key={bucket.key} style={styles.barCol}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: bucket.total ? `${Math.max(8, (bucket.total / maxRevenue) * 100)}%` : '0%',
                          backgroundColor: palette.brand.orange,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: bucket.count ? `${Math.max(8, (bucket.count / maxOrders) * 100)}%` : '0%',
                          backgroundColor: 'rgba(255,255,255,0.55)',
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.daysRow}>
                {analytics.buckets.map((bucket) => (
                  <Text key={bucket.key} style={styles.dayLabel}>{bucket.label}</Text>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.chartEmpty}>
              <Ionicons name="stats-chart-outline" size={28} color={palette.ink.onDarkMuted} />
              <Text style={styles.stateText}>No sales in this period yet.</Text>
            </View>
          )}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: palette.brand.orange }]} />
              <Text style={styles.legendLabel}>Revenue</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.legendLabel}>Orders</Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          {renderKpi('Orders', String(analytics.orderCount))}
          {renderKpi('AOV', formatKobo(aov))}
          {renderKpi('Items sold', String(analytics.itemsSold))}
        </View>

        <Text style={styles.sectionTitle}>Top products</Text>
        <View style={styles.list}>
          {analytics.topProducts.length ? (
            analytics.topProducts.map((product) => (
              <View key={product.key} style={styles.productRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productSold}>{product.sold} sold</Text>
                </View>
                <Text style={styles.productRevenue}>{formatKobo(product.revenue)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.stateText}>No product sales yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function renderKpi(label: string, value: string) {
  return (
    <View key={label} style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function buildAnalytics(orders: Order[], period: Period) {
  const buckets = buildBuckets(period);
  const productMap = new Map<string, ProductMetric>();
  let totalRevenue = 0;
  let orderCount = 0;
  let itemsSold = 0;

  for (const order of orders) {
    const placedAt = new Date(order.placedAt);
    if (Number.isNaN(placedAt.getTime())) continue;

    const bucket = buckets.find((item) => placedAt >= item.start && placedAt < item.end);
    if (!bucket) continue;

    bucket.total += order.grandTotal;
    bucket.count += 1;
    totalRevenue += order.grandTotal;
    orderCount += 1;

    for (const item of order.items) {
      const key = item.productId ?? item.name;
      const current = productMap.get(key) ?? {
        key,
        name: item.name,
        sold: 0,
        revenue: 0,
      };
      current.sold += item.qty;
      current.revenue += item.unit * item.qty;
      itemsSold += item.qty;
      productMap.set(key, current);
    }
  }

  return {
    buckets,
    totalRevenue,
    orderCount,
    itemsSold,
    topProducts: Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  };
}

function buildBuckets(period: Period): Bucket[] {
  const now = new Date();

  if (period === '7D') {
    return Array.from({ length: 7 }, (_, index) => {
      const start = startOfDay(addDays(now, index - 6));
      return {
        key: start.toISOString(),
        label: start.toLocaleDateString('en-NG', { weekday: 'short' }).slice(0, 1),
        start,
        end: addDays(start, 1),
        total: 0,
        count: 0,
      };
    });
  }

  if (period === '4W') {
    return Array.from({ length: 4 }, (_, index) => {
      const start = startOfDay(addDays(now, -((3 - index) * 7 + 6)));
      return {
        key: start.toISOString(),
        label: `W${index + 1}`,
        start,
        end: addDays(start, 7),
        total: 0,
        count: 0,
      };
    });
  }

  const length = period === '3M' ? 3 : 12;
  return Array.from({ length }, (_, index) => {
    const start = startOfMonth(addMonths(now, index - (length - 1)));
    return {
      key: start.toISOString(),
      label: start.toLocaleDateString('en-NG', { month: 'short' }).slice(0, period === '3M' ? 3 : 1),
      start,
      end: addMonths(start, 1),
      total: 0,
      count: 0,
    };
  });
}

function periodLabel(period: Period) {
  if (period === '7D') return 'Last 7 days';
  if (period === '4W') return 'Last 4 weeks';
  if (period === '3M') return 'Last 3 months';
  return 'Last 12 months';
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], gap: spacing['3'], paddingBottom: 40 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
  stateCard: {
    padding: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: spacing['2'],
  },
  stateText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  retryText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  chartCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
  chartMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  chartMetaText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  chartEmpty: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  list: { gap: spacing['2'] },
  emptyCard: {
    padding: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
