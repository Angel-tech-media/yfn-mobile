import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { InsightHighlightsCard } from '@/components/ui/InsightHighlightsCard';
import { HIVE } from '@/src/data/hive';
import { palette, radius, spacing, typography } from '@/src/theme';

const NEWS_HEADLINES = [
  {
    id: 'n1',
    headline: 'Super Eagles draw shocks fans, jersey demand spikes 6x in Lagos',
    source: 'Vibe Sport',
    age: '12m',
    tag: 'Sport',
    cover: ['#3a2818', '#1f1108'] as [string, string],
  },
  {
    id: 'n2',
    headline: "Davido drops 'Timeless II' — merch pre-orders open",
    source: 'Vibe Music',
    age: '1h',
    tag: 'Music',
    cover: ['#3a1f2c', '#1f0e17'] as [string, string],
  },
  {
    id: 'n3',
    headline: 'Detty December: how vendors are pricing experiences',
    source: 'Vibe Lifestyle',
    age: '3h',
    tag: 'Trending',
    cover: ['#1f3a2c', '#0f1f17'] as [string, string],
  },
];

export default function HiveTabScreen() {
  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>The Hive</Text>
            <Text style={styles.title}>Find your people</Text>
          </View>
          <Pressable hitSlop={8} accessibilityLabel="Search" style={styles.iconBtn}>
            <Ionicons name="search" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        {/* Breadcrumb path — Windows Explorer style */}
        <View style={styles.breadcrumb}>
          <Ionicons name="apps" size={14} color={palette.brand.orange} />
          <Text style={styles.crumb}>Hive</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Weekly insights highlight — chartreuse hero from NewsBot */}
          <InsightHighlightsCard
            kicker="Weekly insights"
            title="Discover every Hive moment this week"
            subtitle="NewsBot summarised 12 trending topics across your communities. Tap to read the recap."
            pageOf={{ current: 0, total: 3 }}
            onPress={() => router.push('/(tabs)/news' as never)}
          />

          {/* Bot intro card */}
          <LinearGradient
            colors={['rgba(216, 149, 68, 0.18)', 'rgba(0, 0, 0, 0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.botCard}>
            <View style={styles.botAvatar}>
              <Ionicons name="sparkles" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.botName}>VibeBot</Text>
              <Text style={styles.botMessage}>
                Pick a category — I'll show you the trending topics and the most active groups.
              </Text>
            </View>
          </LinearGradient>

          {/* News from NewsBot — blended into Hive */}
          <View style={styles.newsHeader}>
            <View style={styles.newsHeaderLeft}>
              <Ionicons name="newspaper" size={14} color={palette.brand.orange} />
              <Text style={styles.sectionTitleInline}>Latest from NewsBot</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/news' as never)}>
              <Text style={styles.seeAllLink}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newsRow}>
            {NEWS_HEADLINES.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => router.push(`/news/${n.id}` as never)}
                style={styles.newsCard}>
                <LinearGradient colors={n.cover} style={styles.newsCover}>
                  <View style={styles.newsTagPill}>
                    <Text style={styles.newsTagText}>{n.tag}</Text>
                  </View>
                </LinearGradient>
                <Text style={styles.newsHeadline} numberOfLines={3}>
                  {n.headline}
                </Text>
                <View style={styles.newsMeta}>
                  <Text style={styles.newsSource}>{n.source}</Text>
                  <View style={styles.newsDot} />
                  <Text style={styles.newsAge}>{n.age} ago</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.categoryGrid}>
            {HIVE.map((cat) => (
              <Pressable
                key={cat.slug}
                onPress={() => router.push(`/hive/${cat.slug}` as never)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && { opacity: 0.92 },
                ]}>
                <View style={styles.categoryEmojiWrap}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryMeta}>
                  {countCommunities(cat)} communities
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Trending now</Text>
          {flatLeaves(HIVE)
            .sort((a, b) => (b.node.members ?? 0) - (a.node.members ?? 0))
            .slice(0, 5)
            .map((leaf) => (
              <Pressable
                key={leaf.path}
                onPress={() => router.push(`/hive/${leaf.path}` as never)}
                style={styles.trendingRow}>
                <View style={styles.trendingEmoji}>
                  <Text style={styles.categoryEmoji}>{leaf.node.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trendingName}>{leaf.node.name}</Text>
                  {leaf.node.pinnedTopic ? (
                    <Text style={styles.trendingTopic} numberOfLines={1}>
                      📌 {leaf.node.pinnedTopic}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.memberCount}>
                  <Ionicons name="people" size={11} color={palette.ink.onDarkSoft} />
                  <Text style={styles.memberCountText}>
                    {formatMembers(leaf.node.members ?? 0)}
                  </Text>
                </View>
              </Pressable>
            ))}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function countCommunities(node: { children?: typeof HIVE }): number {
  if (!node.children) return 1;
  return node.children.reduce((acc, c) => acc + countCommunities(c), 0);
}

function flatLeaves(
  nodes: typeof HIVE,
  prefix: string[] = [],
): Array<{ node: (typeof HIVE)[number]; path: string }> {
  const out: Array<{ node: (typeof HIVE)[number]; path: string }> = [];
  for (const n of nodes) {
    const next = [...prefix, n.slug];
    if (!n.children) {
      out.push({ node: n, path: next.join('/') });
    } else {
      out.push(...flatLeaves(n.children, next));
    }
  }
  return out;
}

function formatMembers(n: number) {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['3'],
  },
  kicker: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { ...typography.h2, color: palette.ink.onDarkStrong, marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['3'],
  },
  crumb: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  scroll: { paddingBottom: 100 },
  botCard: {
    marginHorizontal: spacing['4'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.3)',
  },
  botAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botName: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
    fontSize: 13,
  },
  botMessage: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['4'],
    marginTop: spacing['5'],
    marginBottom: spacing['3'],
  },
  sectionTitleInline: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    marginTop: spacing['5'],
    marginBottom: spacing['3'],
  },
  newsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeAllLink: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  newsRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
  },
  newsCard: {
    width: 240,
    gap: 6,
  },
  newsCover: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    padding: spacing['2'],
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  newsTagPill: {
    paddingHorizontal: spacing['2'],
    height: 22,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  newsTagText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  newsHeadline: {
    ...typography.bodyEmphasis,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
    marginTop: 2,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newsSource: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  newsDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: palette.ink.onDarkMuted,
  },
  newsAge: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
  },
  categoryCard: {
    width: '47.5%',
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    gap: 6,
  },
  categoryEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: { fontSize: 20 },
  categoryName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  categoryMeta: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: palette.line.onDark,
  },
  trendingEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  trendingTopic: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  memberCountText: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});
