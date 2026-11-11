import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useNewsFeed } from '@/src/api/news/hooks';
import type { Article } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';

type Tab = 'For you' | 'Trending' | 'Music' | 'Sport' | 'Business';

const TABS: Tab[] = ['For you', 'Trending', 'Music', 'Sport', 'Business'];
const FALLBACK_COVER: [string, string] = ['#3a2818', '#1f1108'];

export default function NewsScreen() {
  const [active, setActive] = useState<Tab>('For you');
  const { data, isError, isLoading, refetch } = useNewsFeed({
    category: active,
    personalised: active === 'For you',
    limit: 24,
  });
  const articles = data?.articles ?? [];
  const hero = articles[0];
  const grid = articles.slice(1, 9);
  const list = articles.slice(9);
  const insight = hero
    ? `${hero.category} is trending with ${hero.claps.toLocaleString()} claps and ${hero.comments.toLocaleString()} comments.`
    : 'Vendor insights will appear when news trends are available.';

  const open = (id: string) => router.push(`/news/${id}` as never);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>News</Text>
          <Pressable hitSlop={8} accessibilityLabel="Search news">
            <Ionicons name="search" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}>
          {TABS.map((tab) => {
            const on = active === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActive(tab)}
                style={[styles.tab, on && styles.tabOn]}>
                <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <LinearGradient
            colors={['rgba(232, 93, 63,0.20)', 'rgba(255,61,0,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="sparkles" size={16} color={palette.brand.orange} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightLabel}>Aktive Insight · for vendors</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.ink.onDarkSoft} />
          </LinearGradient>

          <Text style={styles.sectionTitle}>Trending now</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendRow}>
            {(data?.trendingTags ?? []).map((tag) => (
              <Pressable key={tag} style={styles.trendChip}>
                <Text style={styles.trendTag}>#{tag}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {isLoading ? (
            <Text style={styles.stateText}>Loading news...</Text>
          ) : isError ? (
            <View style={styles.stateBlock}>
              <Text style={styles.stateTitle}>News is unavailable</Text>
              <Text style={styles.stateCopy}>Pull from the backend failed. Try again.</Text>
              <Pressable onPress={() => refetch()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : hero ? (
            <Pressable onPress={() => open(hero.id)} style={styles.heroCard}>
              <ArticleCover article={hero} style={styles.heroImage}>
                <View style={styles.heroTagPill}>
                  <Text style={styles.heroTagText}>{hero.category}</Text>
                </View>
              </ArticleCover>
              <View style={styles.heroBody}>
                <Text style={styles.heroHeadline}>{hero.title}</Text>
                <View style={styles.metaLine}>
                  <Text style={styles.metaSource}>{sourceLabel(hero)}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaAge}>{ageLabel(hero.publishedAt)}</Text>
                </View>
                <View style={styles.heroInsight}>
                  <Ionicons name="trending-up" size={12} color={palette.brand.orange} />
                  <Text style={styles.heroInsightText}>
                    {hero.claps.toLocaleString()} claps
                  </Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <Text style={styles.stateText}>No articles published yet.</Text>
          )}

          {grid.length ? (
            <>
              <Text style={styles.sectionTitle}>Top stories</Text>
              <View style={styles.grid}>
                {grid.map((article) => (
                  <Pressable
                    key={article.id}
                    onPress={() => open(article.id)}
                    style={styles.gridCard}>
                    <ArticleCover article={article} style={styles.gridImage}>
                      <View style={styles.gridTag}>
                        <Text style={styles.gridTagText}>{article.category}</Text>
                      </View>
                      <Pressable hitSlop={6} style={styles.gridSave}>
                        <Ionicons
                          name={article.savedByMe ? 'bookmark' : 'bookmark-outline'}
                          size={14}
                          color="#fff"
                        />
                      </Pressable>
                    </ArticleCover>
                    <Text style={styles.gridHeadline} numberOfLines={3}>
                      {article.title}
                    </Text>
                    <View style={styles.metaLine}>
                      <Text style={styles.metaSource}>{sourceLabel(article)}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.metaAge}>{ageLabel(article.publishedAt)}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {list.length ? (
            <>
              <Text style={styles.sectionTitle}>Latest</Text>
              {list.map((article) => (
                <Pressable
                  key={article.id}
                  onPress={() => open(article.id)}
                  style={styles.articleRow}>
                  <ArticleCover article={article} style={styles.articleThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.articleHeadline} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <View style={styles.metaLine}>
                      <Text style={styles.metaSource}>{sourceLabel(article)}</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.metaAge}>{ageLabel(article.publishedAt)}</Text>
                    </View>
                  </View>
                  <Pressable hitSlop={6}>
                    <Ionicons
                      name={article.savedByMe ? 'bookmark' : 'bookmark-outline'}
                      size={18}
                      color={palette.ink.onDarkSoft}
                    />
                  </Pressable>
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function sourceLabel(article: Article) {
  const { author } = article;
  if (author && typeof author === 'object') {
    const role = 'role' in author ? (author as { role?: unknown }).role : undefined;
    if (typeof role === 'string' && role.trim()) return role;

    const name = 'name' in author ? (author as { name?: unknown }).name : undefined;
    if (typeof name === 'string' && name.trim()) return name;
  }
  return 'Aktive News';
}

function ageLabel(value: string) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ArticleCover({
  article,
  children,
  style,
}: {
  article: Article;
  children?: ReactNode;
  style: StyleProp<ViewStyle>;
}) {
  if (article.coverUrl) {
    return (
      <View style={style}>
        <Image source={{ uri: article.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        {children}
      </View>
    );
  }
  return (
    <LinearGradient colors={FALLBACK_COVER} style={style}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h2, color: palette.ink.onDarkStrong },
  tabsRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
    paddingBottom: spacing['3'],
  },
  tab: {
    paddingHorizontal: spacing['3'],
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  tabOn: {
    backgroundColor: palette.bg.surface,
    borderColor: palette.bg.surface,
  },
  tabLabel: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  tabLabelOn: { color: palette.ink.onLightStrong },
  scroll: { paddingBottom: 120 },
  insightCard: {
    marginHorizontal: spacing['4'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 63,0.3)',
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232, 93, 63,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: {
    ...typography.small,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  insightText: {
    ...typography.body,
    color: palette.ink.onDarkStrong,
  },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['4'],
    marginTop: spacing['5'],
    marginBottom: spacing['3'],
  },
  trendRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
  },
  trendChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  trendTag: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  stateBlock: { paddingHorizontal: spacing['4'], gap: spacing['2'] },
  stateTitle: { ...typography.title, color: palette.ink.onDarkStrong },
  stateText: {
    ...typography.body,
    color: palette.ink.onDarkSoft,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  stateCopy: {
    ...typography.body,
    color: palette.ink.onDarkSoft,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['4'],
    height: 36,
    borderRadius: radius.md,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  heroCard: {
    marginHorizontal: spacing['4'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(40, 26, 16, 0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 3,
  },
  heroImage: {
    height: 180,
    padding: spacing['3'],
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  heroTagPill: {
    paddingHorizontal: spacing['3'],
    height: 24,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  heroTagText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  heroBody: { padding: spacing['3'], gap: 6 },
  heroHeadline: {
    ...typography.title,
    fontSize: 17,
    lineHeight: 23,
    color: palette.ink.onDarkStrong,
  },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaSource: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: palette.ink.onDarkMuted,
  },
  metaAge: { ...typography.caption, color: palette.ink.onDarkMuted },
  heroInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroInsightText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
  },
  grid: {
    paddingHorizontal: spacing['4'],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
  },
  gridCard: {
    width: '47.5%',
    gap: 6,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    padding: spacing['2'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridTag: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    justifyContent: 'center',
  },
  gridTagText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  gridSave: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridHeadline: {
    ...typography.bodyEmphasis,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: palette.line.onDark,
  },
  articleThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  articleHeadline: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
});
