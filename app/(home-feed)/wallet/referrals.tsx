import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import {
  REFERRAL_FEE_NGN,
  REFERRAL_RATE_LABEL,
  useEngagement,
  useRepostStats,
} from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

export default function ReferralsScreen() {
  const { list, totalEarnings, totalClicks, totalConversions } = useRepostStats();
  const removeRepost = useEngagement((s) => s.toggleRepost);

  const conversionRate = totalClicks
    ? Math.round((totalConversions / totalClicks) * 100)
    : 0;

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Referral earnings</Text>
            <Text style={styles.subtitle}>Earn from every product you repost</Text>
          </View>
          <Pressable hitSlop={8} accessibilityLabel="Help" style={styles.iconBtn}>
            <Ionicons name="help-circle-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero earnings card */}
          <LinearGradient
            colors={[palette.brand.orange, palette.brand.orangeDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>
            <Text style={styles.heroLabel}>Total earned from reposts</Text>
            <Text style={styles.heroAmount}>{fmt(totalEarnings)}</Text>
            <View style={styles.heroFooter}>
              <Pressable
                onPress={() => router.push('/vendor-dashboard/withdraw' as never)}
                style={styles.heroAction}>
                <Ionicons name="arrow-up-circle" size={16} color="#fff" />
                <Text style={styles.heroActionLabel}>Send to bank</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/wallet' as never)}
                style={styles.heroAction}>
                <Ionicons name="wallet-outline" size={16} color="#fff" />
                <Text style={styles.heroActionLabel}>View wallet</Text>
              </Pressable>
            </View>
          </LinearGradient>

          {/* KPI grid */}
          <View style={styles.kpiGrid}>
            <Kpi label="Reposts" value={String(list.length)} icon="repeat" />
            <Kpi label="Clicks" value={String(totalClicks)} icon="finger-print" />
            <Kpi label="Buys" value={String(totalConversions)} icon="bag-check" />
            <Kpi label="Conv. rate" value={`${conversionRate}%`} icon="trending-up" />
          </View>

          {/* Earnings explainer */}
          <View style={styles.explainer}>
            <Ionicons name="information-circle" size={16} color={palette.brand.orange} />
            <Text style={styles.explainerText}>
              Buyers pay an extra ₦{REFERRAL_FEE_NGN} on top of the price when they reach the
              vendor through your repost. {REFERRAL_RATE_LABEL}.
            </Text>
          </View>

          {/* Repost list */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Your reposts</Text>
            <Pressable hitSlop={8}>
              <Text style={styles.listLink}>Filter</Text>
            </Pressable>
          </View>

          {list.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="repeat" size={32} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyTitle}>No reposts yet</Text>
              <Text style={styles.emptyText}>
                Tap the repeat icon on any product you love. Earn every time someone
                buys via your repost.
              </Text>
            </View>
          ) : (
            list.map((r) => (
              <Pressable
                key={r.productId}
                onPress={() => router.push(`/product/${r.productId}` as never)}
                style={styles.repostCard}>
                <View style={styles.repostThumb}>
                  <Ionicons name="bag" size={18} color={palette.ink.onLightStrong} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.repostProduct} numberOfLines={1}>
                    Product {r.productId}
                  </Text>
                  <Text style={styles.repostVendor} numberOfLines={1}>
                    @{r.vendorId} · {visibilityLabel(r.visibility)} ·{' '}
                    {timeAgo(r.ts)}
                  </Text>
                  <View style={styles.repostStats}>
                    <View style={styles.repostStat}>
                      <Ionicons
                        name="finger-print"
                        size={11}
                        color={palette.ink.onDarkSoft}
                      />
                      <Text style={styles.repostStatText}>{r.clicks} clicks</Text>
                    </View>
                    <View style={styles.repostStat}>
                      <Ionicons
                        name="bag-check"
                        size={11}
                        color={palette.ink.onDarkSoft}
                      />
                      <Text style={styles.repostStatText}>
                        {r.conversions} buys
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.repostEarning}>
                  <Text style={styles.repostEarningAmount}>
                    {fmt(r.earningsNgn)}
                  </Text>
                  <Pressable
                    onPress={() =>
                      removeRepost({
                        productId: r.productId,
                        vendorId: r.vendorId,
                      })
                    }
                    hitSlop={6}>
                    <Text style={styles.repostRemove}>Remove</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function Kpi({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.kpi}>
      <View style={styles.kpiIcon}>
        <Ionicons name={icon} size={14} color={palette.brand.orange} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function timeAgo(ts: number) {
  const diffMin = Math.floor((Date.now() - ts) / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function visibilityLabel(v: string) {
  if (v === 'mutuals') return 'Mutuals';
  if (v === 'close-friends') return 'Close friends';
  return 'Public';
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  title: { ...typography.h2, color: palette.ink.onDarkStrong },
  subtitle: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  scroll: { paddingBottom: 80 },
  hero: {
    marginHorizontal: spacing['4'],
    padding: spacing['5'],
    borderRadius: radius.xl,
    gap: spacing['2'],
    shadowColor: palette.brand.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroAmount: {
    ...typography.display,
    color: '#fff',
    fontSize: 36,
    lineHeight: 42,
  },
  heroFooter: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroActionLabel: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
    gap: spacing['2'],
  },
  kpi: {
    width: '47.5%',
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    gap: 4,
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(216, 149, 68,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    ...typography.h2,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
    marginTop: 2,
  },
  kpiLabel: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  explainer: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
  },
  explainerText: {
    flex: 1,
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    lineHeight: 17,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['5'],
    paddingBottom: spacing['3'],
  },
  listTitle: { ...typography.title, color: palette.ink.onDarkStrong },
  listLink: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
    paddingHorizontal: spacing['5'],
    gap: 8,
  },
  emptyTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
  },
  repostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginHorizontal: spacing['4'],
    marginBottom: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  repostThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repostProduct: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  repostVendor: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  repostStats: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginTop: 4,
  },
  repostStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repostStatText: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
  },
  repostEarning: {
    alignItems: 'flex-end',
    gap: 4,
  },
  repostEarningAmount: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
  },
  repostRemove: {
    ...typography.small,
    color: palette.status.danger,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});
