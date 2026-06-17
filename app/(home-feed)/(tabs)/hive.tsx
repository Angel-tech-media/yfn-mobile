import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useHiveTree } from '@/src/api/hive/hooks';
import { useNewsFeed } from '@/src/api/news/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';

import type { Article, HiveNode } from '@/src/api/types';

export default function HiveTabScreen() {
  const { data: hive = [], isLoading: hiveLoading, isError: hiveError } = useHiveTree();
  const { data: news } = useNewsFeed({ limit: 3 });
  const articles = (news?.articles ?? []).filter(isRealArticle);
  const leaves = flatLeaves(hive);

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

        <View style={styles.breadcrumb}>
          <Ionicons name="apps" size={14} color={palette.brand.orange} />
          <Text style={styles.crumb}>Hive</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {articles.length ? renderNews(articles) : null}

          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryGrid}>
            {hiveLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading communities...</Text>
              </View>
            ) : hiveError ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Could not load communities.</Text>
              </View>
            ) : (
              hive.map(renderCategory)
            )}
          </View>

          {leaves.length ? (
            <>
              <Text style={styles.sectionTitle}>Trending now</Text>
              {leaves
                .sort((a, b) => (b.node.members ?? 0) - (a.node.members ?? 0))
                .slice(0, 5)
                .map(renderTrending)}
            </>
          ) : null}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function renderNews(articles: Article[]) {
  return (
    <>
      <View style={styles.newsHeader}>
        <View style={styles.newsHeaderLeft}>
          <Ionicons name="newspaper" size={14} color={palette.brand.orange} />
          <Text style={styles.sectionTitleInline}>Latest</Text>
        </View>
        <Pressable hitSlop={8} onPress={() => router.push('/(tabs)/news' as never)}>
          <Text style={styles.seeAllLink}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.newsRow}>
        {articles.slice(0, 3).map((article) => (
          <Pressable
            key={article.id}
            onPress={() => router.push(`/news/${article.id}` as never)}
            style={styles.newsCard}>
            <LinearGradient colors={coverColors(article.category)} style={styles.newsCover}>
              <View style={styles.newsTagPill}>
                <Text style={styles.newsTagText}>{article.category}</Text>
              </View>
            </LinearGradient>
            <Text style={styles.newsHeadline} numberOfLines={3}>
              {article.title}
            </Text>
            <View style={styles.newsMeta}>
              <Text style={styles.newsSource}>{article.author.name}</Text>
              <View style={styles.newsDot} />
              <Text style={styles.newsAge}>{formatDate(article.publishedAt)}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

function renderCategory(cat: HiveNode) {
  return (
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
  );
}

function renderTrending(leaf: { node: HiveNode; path: string }) {
  return (
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
            {leaf.node.pinnedTopic}
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
  );
}

function isRealArticle(article: Article) {
  const title = article.title.trim().toLowerCase();
  if (title === 'how local vendors win with faster fulfillment') return false;
  return !hasSeedMarker(article.title) && !hasSeedMarker(article.author.name);
}

function hasSeedMarker(value: string) {
  const normalized = value.toLowerCase();
  return ['demo', 'sample', 'dummy', 'placeholder', 'test'].some((term) =>
    normalized.includes(term),
  );
}

function countCommunities(node: HiveNode): number {
  if (!node.children) return 1;
  return node.children.reduce((acc, child) => acc + countCommunities(child), 0);
}

function flatLeaves(
  nodes: HiveNode[],
  prefix: string[] = [],
): { node: HiveNode; path: string }[] {
  const out: { node: HiveNode; path: string }[] = [];
  for (const node of nodes) {
    const next = [...prefix, node.slug];
    if (!node.children) {
      out.push({ node, path: next.join('/') });
    } else {
      out.push(...flatLeaves(node.children, next));
    }
  }
  return out;
}

function formatMembers(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function coverColors(category: string): [string, string] {
  if (category === 'Sport') return ['#3a2818', '#1f1108'];
  if (category === 'Music') return ['#3a1f2c', '#1f0e17'];
  return ['#1f3a2c', '#0f1f17'];
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
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
  newsHeader: {
    paddingHorizontal: spacing['4'],
    marginTop: spacing['2'],
    marginBottom: spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitleInline: { ...typography.title, color: palette.ink.onDarkStrong },
  seeAllLink: { ...typography.bodyEmphasis, color: palette.brand.orange },
  newsRow: { paddingHorizontal: spacing['4'], gap: spacing['3'], paddingBottom: spacing['4'] },
  newsCard: { width: 210, gap: spacing['2'] },
  newsCover: {
    height: 105,
    borderRadius: radius.md,
    overflow: 'hidden',
    padding: spacing['2'],
  },
  newsTagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['2'],
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  newsTagText: { ...typography.small, color: '#fff', fontFamily: typography.bodyEmphasis.fontFamily },
  newsHeadline: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newsSource: { ...typography.caption, color: palette.brand.orange, fontFamily: typography.bodyEmphasis.fontFamily },
  newsDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: palette.ink.onDarkMuted },
  newsAge: { ...typography.caption, color: palette.ink.onDarkMuted },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['4'],
    marginTop: spacing['4'],
    marginBottom: spacing['3'],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
  },
  categoryCard: {
    width: '47%',
    minHeight: 118,
    borderRadius: radius.lg,
    padding: spacing['3'],
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: spacing['2'],
  },
  categoryEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  categoryEmoji: { fontSize: 24 },
  categoryName: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong, fontSize: 15 },
  categoryMeta: { ...typography.caption, color: palette.ink.onDarkMuted },
  emptyState: {
    width: '100%',
    padding: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  emptyText: { ...typography.body, color: palette.ink.onDarkSoft },
  trendingRow: {
    marginHorizontal: spacing['4'],
    marginBottom: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  trendingEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  trendingName: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  trendingTopic: { ...typography.caption, color: palette.ink.onDarkMuted },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['2'],
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  memberCountText: { ...typography.small, color: palette.ink.onDarkSoft },
});
