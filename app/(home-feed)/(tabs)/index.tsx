import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Badge, Chip } from '@/components/kit/Chip';
import { NavIconButton } from '@/components/kit/Fields';
import { LargeTitleHeader, SectionHeader } from '@/components/kit/Header';
import { PostCard, type PostItem } from '@/components/feed/PostCard';
import { ProductCard } from '@/components/product/ProductCard';
import { Avatar } from '@/components/ui/Avatar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { useMe } from '@/src/api/account/hooks';
import { useConversations } from '@/src/api/chat/hooks';
import { useFeed, useFeedReels, useStoriesInbox } from '@/src/api/feed/hooks';
import { useMarketplaceHome } from '@/src/api/marketplace/hooks';
import { useNewsFeed } from '@/src/api/news/hooks';
import { CURATED_NEWS } from '@/src/data/curated-news';
import { useCartCount } from '@/src/store/cart';
import { getDynamicHomeTabs, useHomeTabs, type HomeTab } from '@/src/store/home-tabs';
import { plasma } from '@/src/theme/plasma';
import { continuous, corner, layout, solidBackground, type, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

import type { Article, Post, Story } from '@/src/api/types';

export default function HomeFeedScreen() {
  const ui = useUi();
  const { data, isError, isFetching, refetch } = useFeed({ limit: 30 });
  const { data: storiesData = [], refetch: refetchStories } = useStoriesInbox();
  const { data: reels = [], refetch: refetchReels } = useFeedReels({ limit: 10 });
  const { data: marketData, refetch: refetchMarket } = useMarketplaceHome({ limit: 12 });
  const { data: newsData, refetch: refetchNews } = useNewsFeed({ limit: 12 });
  const { data: me } = useMe();
  const { data: threads = [] } = useConversations();
  const cartCount = useCartCount();
  const [refreshing, setRefreshing] = useState(false);

  const activeTab = useHomeTabs((s) => s.activeTab);
  const lastSeenAt = useHomeTabs((s) => s.lastSeenAt);
  const latestUpdatedAt = useHomeTabs((s) => s.latestUpdatedAt);
  const setActiveTab = useHomeTabs((s) => s.setActiveTab);
  const reportStreamUpdate = useHomeTabs((s) => s.reportStreamUpdate);

  const orderedTabs = useMemo(
    () => getDynamicHomeTabs(lastSeenAt, latestUpdatedAt),
    [lastSeenAt, latestUpdatedAt],
  );

  const drops = marketData?.products ?? [];
  const articles: Article[] = useMemo(() => {
    const remote = newsData?.articles ?? [];
    return remote.length > 0 ? remote : CURATED_NEWS;
  }, [newsData?.articles]);

  // Report stream freshness so dynamic tabs bubble closer to the left when updated
  useEffect(() => {
    if (articles.length > 0) {
      const newestArticleMs = Math.max(
        ...articles.map((a) => (a.publishedAt ? new Date(a.publishedAt).getTime() : 0)),
      );
      if (newestArticleMs > 0) {
        reportStreamUpdate('News', newestArticleMs);
      }
    }
  }, [articles, reportStreamUpdate]);

  useEffect(() => {
    if (drops.length > 0) {
      reportStreamUpdate('Shop drops', Date.now() - 3 * 60_000);
    }
  }, [drops.length, reportStreamUpdate]);

  const unreadCount = threads.filter((t) => {
    const mine = t.participants?.find((p) => p.userId === me?.id);
    if (!mine) return false;
    if (!mine.lastReadAt) return true;
    return new Date(t.updatedAt).getTime() > new Date(mine.lastReadAt).getTime();
  }).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchStories(), refetchReels(), refetchMarket(), refetchNews()]);
    setRefreshing(false);
  }, [refetch, refetchStories, refetchReels, refetchMarket, refetchNews]);

  const posts = data?.items.map(toPostItem) ?? [];
  const authors = Array.from(
    storiesData
      .reduce((acc, story) => {
        const id = story?.author?.id;
        if (id && !acc.has(id)) acc.set(id, story.author);
        return acc;
      }, new Map<string, Story['author']>())
      .values(),
  );
  const myAvatar = me?.avatarUrl ? { uri: me.avatarUrl } : undefined;
  const myName = me?.name || me?.displayName || me?.username || 'Me';

  return (
    <EspressoBackground>
      <LargeTitleHeader
        leading={<BrandLogo size="md" />}
        title=""
        trailing={
          <>
            <NavIconButton icon="search-outline" label="Search" onPress={() => router.push('/search' as never)} />
            <NavIconButton icon="paper-plane-outline" label="Messages" badge={unreadCount} onPress={() => router.push('/inbox' as never)} />
            <NavIconButton icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
            <NavIconButton icon="bag-outline" label="Cart" badge={cartCount} onPress={() => router.push('/cart' as never)} />
          </>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing || isFetching} onRefresh={onRefresh} tintColor={ui.accent} />
        }>
        {/* Dynamic Filter Tabs (ordered by unseen updates & freshness / lastSeen) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabChips}>
          {orderedTabs.map((t: HomeTab) => {
            const isSelected = activeTab === t;
            const hasUnseen = !isSelected && (latestUpdatedAt[t] ?? 0) > (lastSeenAt[t] ?? 0);
            return (
              <PressableScale
                key={t}
                haptic="selection"
                scaleTo={0.94}
                onPress={() => setActiveTab(t)}
                style={[
                  styles.tabChip,
                  isSelected
                    ? { backgroundColor: ui.label }
                    : { backgroundColor: ui.card, borderColor: ui.separator, borderWidth: StyleSheet.hairlineWidth },
                ]}>
                <Text
                  style={[
                    type.caption,
                    styles.tabChipText,
                    { color: isSelected ? ui.background : ui.secondaryLabel },
                  ]}>
                  {t}
                </Text>
                {hasUnseen ? (
                  <View style={[styles.unseenDot, { backgroundColor: ui.coral }]} />
                ) : null}
              </PressableScale>
            );
          })}
        </ScrollView>

        {activeTab === 'News' ? (
          /* Lovable News Tab: Editorial cards, first card in deep Forest Ink with Lime tag */
          <View style={styles.newsSection}>
            {articles.map((article, idx) => {
              const isHero = idx === 0;
              return (
                <PressableScale
                  key={article.id ? `news-${article.id}` : `news-${idx}`}
                  accessibilityRole="button"
                  accessibilityLabel={article.title}
                  haptic="light"
                  scaleTo={0.985}
                  onPress={() => router.push(`/news/${article.id}` as never)}
                  style={[
                    styles.newsCard,
                    isHero
                      ? { backgroundColor: ui.ink, borderColor: 'rgba(200, 255, 59, 0.22)' }
                      : { backgroundColor: ui.card, borderColor: ui.separator },
                  ]}>
                  {article.coverUrl ? (
                    <View style={[styles.newsImageWrap, { height: isHero ? 208 : 148 }]}>
                      <Image
                        source={{ uri: article.coverUrl }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={180}
                      />
                    </View>
                  ) : null}
                  <View style={styles.newsBody}>
                    <Text
                      style={[
                        styles.newsMeta,
                        { color: isHero ? ui.lime : ui.accent },
                      ]}>
                      {article.category} · {article.readMin || 4} min read
                    </Text>
                    <Text
                      style={[
                        type.title3,
                        styles.newsTitle,
                        { color: isHero ? ui.inkForeground : ui.label },
                      ]}>
                      {article.title}
                    </Text>
                    {article.excerpt ? (
                      <Text
                        style={[
                          type.subhead,
                          { color: isHero ? ui.inkMuted : ui.secondaryLabel },
                        ]}
                        numberOfLines={3}>
                        {article.excerpt}
                      </Text>
                    ) : null}
                  </View>
                </PressableScale>
              );
            })}
          </View>
        ) : activeTab === 'Shop drops' ? (
          <View style={styles.dropsSection}>
            <View style={styles.dropsGrid}>
              {drops.map((product, idx) => (
                <ProductCard
                  key={product.id ? `drop-${product.id}` : `drop-${idx}`}
                  product={product}
                  style={styles.gridItem}
                  onPress={() => router.push(`/product/${product.id}` as never)}
                />
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Stories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
              <StoryTile
                name="Your story"
                onPress={() => router.push('/create/story' as never)}
                avatar={<Avatar size={60} source={myAvatar} initials={initials(myName)} />}
                addable
              />
              {authors.map((a, idx) => (
                <StoryTile
                  key={a?.id ? `story-${a.id}` : `story-${idx}`}
                  name={a?.name || 'User'}
                  onPress={() => router.push(`/story/${a?.id}` as never)}
                  avatar={
                    a?.avatarUrl ? (
                      <Avatar size={60} source={{ uri: a.avatarUrl }} />
                    ) : (
                      <Avatar size={60} initials={initials(a?.name || 'U')} />
                    )
                  }
                  ring
                />
              ))}
            </ScrollView>

            {/* Quick Post Prompt Card (Lovable) */}
            <PressableScale
              haptic="light"
              scaleTo={0.985}
              onPress={() => router.push('/create/post' as never)}
              style={[styles.composerCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Avatar size={34} source={myAvatar} initials={initials(myName)} />
              <Text style={[type.subhead, { color: ui.secondaryLabel, flex: 1 }]}>
                What’s the gist today?
              </Text>
              <View style={[styles.composerPostPill, { backgroundColor: ui.lime }]}>
                <Text style={[styles.composerPostText, { color: ui.limeForeground }]}>Post</Text>
              </View>
            </PressableScale>

            {/* Reels */}
            {reels.length ? (
              <View style={styles.section}>
                <SectionHeader
                  title="Watch & shop"
                  action={
                    <PressableScale haptic="light" onPress={() => router.push('/reels' as never)}>
                      <Text style={[type.subhead, { color: ui.accent }]}>See all</Text>
                    </PressableScale>
                  }
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
                  {reels.map((reel, idx) => (
                    <PressableScale
                      key={reel.id ? `reel-${reel.id}` : `reel-${idx}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Reel by ${reel.author.name}`}
                      haptic="light"
                      scaleTo={0.97}
                      onPress={() => router.push(`/reel?id=${reel.id}` as never)}
                      style={[styles.reel, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                      {reel.coverUrl ? (
                        <Image source={{ uri: reel.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                      ) : null}
                      <LinearGradient colors={['transparent', 'rgba(5,7,15,0.78)']} style={StyleSheet.absoluteFill} />
                      {reel.product ? (
                        <View style={styles.reelBadge}>
                          <Badge tone="price" icon="bag-handle" label={formatKobo(reel.product.price)} />
                        </View>
                      ) : null}
                      <View style={styles.reelMeta}>
                        <Text style={[type.subhead, { color: '#FFF', fontFamily: 'InstrumentSans_600SemiBold' }]} numberOfLines={1}>
                          {reel.author.name}
                        </Text>
                        <Text style={[type.footnote, { color: 'rgba(255,255,255,0.78)' }]} numberOfLines={1}>
                          {reel.caption}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Posts */}
            <View style={styles.posts}>
              {isError ? (
                <View style={styles.empty}>
                  <Ionicons name="cloud-offline-outline" size={32} color={ui.secondaryLabel} />
                  <Text style={[type.callout, { color: ui.secondaryLabel }]}>Couldn’t load your feed.</Text>
                  <Chip label="Try again" selected onPress={() => refetch()} />
                </View>
              ) : null}
              {!isError && !posts.length ? (
                <View style={styles.empty}>
                  <Ionicons name="bag-handle-outline" size={32} color={ui.secondaryLabel} />
                  <Text style={[type.callout, { color: ui.secondaryLabel }]}>Nothing here yet. Follow vendors to fill your feed.</Text>
                </View>
              ) : null}

              {/* First 2 posts */}
              {posts.slice(0, 2).map((post, idx) => (
                <PostCard key={post.id ? `post-${post.id}` : `post-${idx}`} post={post} />
              ))}

              {/* Inset Picked For You Carousel (Lovable) */}
              {activeTab === 'For you' && drops.length > 0 ? (
                <View style={[styles.pickedSection, { borderColor: ui.separator }]}>
                  <View style={styles.pickedHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="sparkles" size={16} color={ui.coral} />
                      <Text style={[type.title3, { color: ui.label }]}>
                        Picked for you
                      </Text>
                    </View>
                    <PressableScale haptic="light" onPress={() => router.push('/market' as never)}>
                      <Text style={[type.subhead, { color: ui.accent, fontFamily: 'InstrumentSans_600SemiBold' }]}>
                        Shop all
                      </Text>
                    </PressableScale>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickedScroll}>
                    {drops.slice(0, 6).map((product, idx) => (
                      <ProductCard
                        key={product.id ? `picked-${product.id}` : `picked-${idx}`}
                        product={product}
                        style={styles.pickedItem}
                        onPress={() => router.push(`/product/${product.id}` as never)}
                      />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {/* Remaining posts */}
              {posts.slice(2).map((post, idx) => (
                <PostCard key={post.id ? `post-${post.id}` : `post-${idx}`} post={post} />
              ))}

              {posts.length > 0 ? (
                <Text style={[type.footnote, styles.caughtUp, { color: ui.tertiaryLabel }]}>
                  You’re all caught up ✨
                </Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </EspressoBackground>
  );
}

function StoryTile({
  name,
  avatar,
  onPress,
  ring,
  addable,
}: {
  name: string;
  avatar: React.ReactNode;
  onPress: () => void;
  ring?: boolean;
  addable?: boolean;
}) {
  const ui = useUi();
  const holeBg = ui.isDark ? solidBackground.dark : solidBackground.light;
  return (
    <PressableScale haptic="light" scaleTo={0.94} onPress={onPress} style={styles.story} accessibilityLabel={name}>
      {ring ? (
        <View style={styles.storyRingWrapper}>
          <LinearGradient
            colors={plasma.story}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.storyRingGradient}>
            <View style={[styles.storyRingHole, { backgroundColor: holeBg }]}>
              {avatar}
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={[styles.storyRing, { borderColor: ui.separator, backgroundColor: ui.card }]}>{avatar}</View>
      )}
      {addable ? (
        <View style={[styles.storyAdd, { backgroundColor: ui.accent, borderColor: holeBg }]}>
          <Ionicons name="add" size={14} color={ui.onAccent} />
        </View>
      ) : null}
      <Text style={[type.caption, { color: ui.secondaryLabel }]} numberOfLines={1}>
        {name}
      </Text>
    </PressableScale>
  );
}

function toPostItem(item: Post): PostItem {
  return {
    id: item.id,
    author: item.author.name,
    authorHandle: item.author.handle,
    authorAvatarUrl: item.author.avatarUrl,
    verified: !!item.author.verified,
    caption: item.caption,
    product: item.product?.name ?? '',
    productId: item.product?.id,
    price: item.product ? formatKobo(item.product.price) : '',
    likes: item.likes,
    comments: item.comments,
    reposts: item.reposts ?? 0,
    likedByMe: item.likedByMe,
    savedByMe: item.savedByMe,
    repostedByMe: item.repostedByMe,
    imageUrls: item.imageUrls,
  };
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('') || 'A'
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, gap: layout.sectionGap },
  tabChips: { paddingHorizontal: layout.gutter, gap: 8, paddingBottom: 4 },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabChipText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  unseenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  composerCard: {
    marginHorizontal: layout.gutter,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...continuous,
  },
  composerPostPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  composerPostText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 12,
    letterSpacing: -0.1,
  },
  newsSection: {
    paddingHorizontal: layout.gutter,
    gap: 16,
    paddingBottom: 28,
  },
  newsCard: {
    borderRadius: corner.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  newsImageWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  newsBody: {
    padding: 16,
    gap: 6,
  },
  newsMeta: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  newsTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    lineHeight: 24,
  },
  pickedSection: {
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
  },
  pickedScroll: {
    paddingHorizontal: layout.gutter,
    gap: 12,
  },
  pickedItem: {
    width: 154,
  },
  dropsSection: {
    paddingHorizontal: layout.gutter,
    paddingBottom: 40,
  },
  dropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridItem: {
    width: '47.5%',
  },
  caughtUp: {
    textAlign: 'center',
    paddingVertical: 24,
    letterSpacing: -0.1,
  },
  stories: { paddingHorizontal: layout.gutter, gap: 14 },
  story: { width: 72, alignItems: 'center', gap: 6 },
  storyRingWrapper: {
    shadowColor: '#162821',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  storyRingGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2.5,
  },
  storyRingHole: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAdd: {
    position: 'absolute',
    top: 46,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: 14 },
  hRow: { paddingHorizontal: layout.gutter, gap: layout.cardGap },
  reel: {
    width: 150,
    aspectRatio: 9 / 14,
    borderRadius: corner.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  reelBadge: { position: 'absolute', top: 10, left: 10 },
  reelMeta: { padding: 12, gap: 2 },
  posts: { paddingHorizontal: layout.gutter, gap: 16 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 48 },
});
