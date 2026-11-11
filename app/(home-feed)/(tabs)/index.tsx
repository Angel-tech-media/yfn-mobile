import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PostCard } from '@/components/feed/PostCard';
import { ProductCard } from '@/components/product/ProductCard';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import {
  getNews,
  getPerson,
  getProduct,
  me,
  news,
  notifications,
  posts,
  products,
  stories,
  useApp,
  type Post,
} from '@/src/data/lovable-data';
import { getDynamicHomeTabs, useHomeTabs, type HomeTab } from '@/src/store/home-tabs';
import { continuous, corner, layout, solidBackground, type, useUi } from '@/src/theme/ui';

export default function HomeFeedScreen() {
  const ui = useUi();
  const [refreshing, setRefreshing] = useState(false);

  const cartCount = useApp((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const following = useApp((s) => s.following);
  const myPosts = useApp((s) => s.myPosts);
  const profileName = useApp((s) => s.profile.name);
  const signedIn = useApp((s) => s.signedIn);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const activeTab = useHomeTabs((s) => s.activeTab);
  const lastSeenAt = useHomeTabs((s) => s.lastSeenAt);
  const latestUpdatedAt = useHomeTabs((s) => s.latestUpdatedAt);
  const setActiveTab = useHomeTabs((s) => s.setActiveTab);
  const reportStreamUpdate = useHomeTabs((s) => s.reportStreamUpdate);

  const orderedTabs = useMemo(
    () => getDynamicHomeTabs(lastSeenAt, latestUpdatedAt),
    [lastSeenAt, latestUpdatedAt]
  );

  // Filter feed based on active tab
  const feed: Post[] = useMemo(() => {
    if (activeTab === 'Following') {
      return posts.filter((p) => following.includes(p.handle));
    }
    return posts;
  }, [activeTab, following]);

  // Report freshness for dynamic tabs
  useEffect(() => {
    reportStreamUpdate('Shop drops', Date.now() - 5 * 60_000);
    reportStreamUpdate('News', Date.now() - 10 * 60_000);
  }, [reportStreamUpdate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <EspressoBackground>
      {/* Sticky Top Header */}
      <View style={[styles.header, { backgroundColor: ui.background }]}>
        <View style={styles.topRow}>
          <View style={styles.logoWrap}>
            <BrandLogo size="md" />
          </View>
          <View style={styles.iconActions}>
            {/* Search */}
            <PressableScale
              haptic="light"
              scaleTo={0.9}
              hitSlop={6}
              onPress={() => router.push('/search' as never)}
              style={[styles.iconCircle, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Ionicons name="search" size={18} color={ui.label} />
            </PressableScale>

            {/* Notifications */}
            <PressableScale
              haptic="light"
              scaleTo={0.9}
              hitSlop={6}
              onPress={() => router.push('/notifications' as never)}
              style={[styles.iconCircle, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Ionicons name="notifications-outline" size={18} color={ui.label} />
              {unreadCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: ui.coral }]}>
                  <Text style={[styles.badgeText, { color: ui.coralForeground }]}>
                    {unreadCount}
                  </Text>
                </View>
              ) : null}
            </PressableScale>

            {/* Cart */}
            <PressableScale
              haptic="light"
              scaleTo={0.9}
              hitSlop={6}
              onPress={() => router.push('/cart' as never)}
              style={[styles.iconCircle, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Ionicons name="bag-handle-outline" size={18} color={ui.label} />
              {cartCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: ui.coral }]}>
                  <Text style={[styles.badgeText, { color: ui.coralForeground }]}>
                    {cartCount}
                  </Text>
                </View>
              ) : null}
            </PressableScale>
          </View>
        </View>

        {/* Dynamic Horizontal Tab Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}>
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
                  styles.tabPill,
                  isSelected
                    ? { backgroundColor: ui.label }
                    : { backgroundColor: ui.card, borderColor: ui.separator, borderWidth: StyleSheet.hairlineWidth },
                ]}>
                <Text
                  style={[
                    styles.tabPillText,
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ui.accent} />
        }>
        {activeTab === 'For you' || activeTab === 'Following' ? (
          <>
            {/* Stories Rail */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRail}>
              {/* Add to Story */}
              <PressableScale
                haptic="light"
                scaleTo={0.94}
                onPress={() => router.push('/create' as never)}
                style={styles.storyItem}>
                <View style={[styles.storyAddCircle, { borderColor: ui.separator, backgroundColor: ui.card }]}>
                  <Ionicons name="add" size={24} color={ui.accent} />
                </View>
                <Text style={[styles.storyName, { color: ui.label }]}>Your story</Text>
              </PressableScale>

              {/* Lovable Stories */}
              {stories.map((s) => {
                const author = getPerson(s.handle);
                if (!author) return null;
                return (
                  <PressableScale
                    key={s.id}
                    haptic="light"
                    scaleTo={0.94}
                    onPress={() => router.push(`/story/${s.id}` as never)}
                    style={styles.storyItem}>
                    <View style={styles.storyRingWrapper}>
                      <LinearGradient
                        colors={[ui.coral, ui.lime]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.storyRingGradient}>
                        <View style={[styles.storyRingHole, { backgroundColor: ui.background }]}>
                          {author.avatar ? (
                            <Image
                              source={author.avatar}
                              style={styles.storyAvatar}
                              contentFit="cover"
                            />
                          ) : (
                            <Text style={[styles.storyInitials, { color: ui.label }]}>
                              {author.name.charAt(0)}
                            </Text>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                    <Text style={[styles.storyName, { color: ui.label }]} numberOfLines={1}>
                      {author.name.split(' ')[0]}
                    </Text>
                  </PressableScale>
                );
              })}
            </ScrollView>

            {/* "What's the gist today?" Composer Card */}
            <PressableScale
              haptic="light"
              scaleTo={0.985}
              onPress={() => router.push('/create/post' as never)}
              style={[styles.composerCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <View style={[styles.composerAvatarWrap, { backgroundColor: ui.cardRaised }]}>
                <Text style={[styles.composerAvatarText, { color: ui.label }]}>
                  {(signedIn ? profileName : me.name).charAt(0)}
                </Text>
              </View>
              <Text style={[styles.composerPrompt, { color: ui.secondaryLabel }]}>
                What's the gist today?
              </Text>
              <View style={[styles.composerPostPill, { backgroundColor: ui.lime }]}>
                <Text style={[styles.composerPostText, { color: ui.limeForeground }]}>Post</Text>
              </View>
            </PressableScale>

            {/* User created posts */}
            {myPosts.map((p) => (
              <View
                key={p.id}
                style={[
                  styles.myPostCard,
                  { backgroundColor: ui.cardRaised, borderColor: ui.accent },
                ]}>
                <Text style={[styles.myPostHeader, { color: ui.accent }]}>You · {p.time}</Text>
                <Text style={[styles.myPostText, { color: ui.label }]}>{p.text}</Text>
              </View>
            ))}

            {/* Empty feed state */}
            {feed.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: ui.secondaryLabel }]}>
                  Follow more people to fill this up.
                </Text>
              </View>
            ) : null}

            {/* First 2 posts */}
            {feed.slice(0, 2).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}

            {/* "Picked for you" Horizontal Product Carousel */}
            {activeTab === 'For you' ? (
              <View style={[styles.pickedSection, { borderTopColor: ui.separator, borderBottomColor: ui.separator }]}>
                <View style={styles.pickedHeader}>
                  <View style={styles.pickedTitleRow}>
                    <Ionicons name="sparkles" size={16} color={ui.coral} />
                    <Text style={[styles.pickedTitle, { color: ui.label }]}>Picked for you</Text>
                  </View>
                  <PressableScale haptic="light" onPress={() => router.push('/market' as never)}>
                    <Text style={[styles.shopAllLink, { color: ui.accent }]}>Shop all</Text>
                  </PressableScale>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickedScroll}>
                  {products.slice(0, 5).map((prod) => (
                    <View key={prod.id} style={styles.pickedItem}>
                      <ProductCard product={prod} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Remaining posts */}
            {feed.slice(2).map((p) => (
              <PostCard key={p.id} post={p} />
            ))}

            {/* "You're all caught up ✨" footer */}
            <View style={styles.caughtUpWrap}>
              <Text style={[styles.caughtUpText, { color: ui.secondaryLabel }]}>
                You're all caught up ✨
              </Text>
            </View>
          </>
        ) : activeTab === 'Shop drops' ? (
          /* Shop Drops: 2-column grid of all products */
          <View style={styles.dropsGrid}>
            {products.map((prod) => (
              <View key={prod.id} style={styles.dropColumn}>
                <ProductCard product={prod} />
              </View>
            ))}
          </View>
        ) : (
          /* News: Editorial list of news cards, 1st card in dark ink */
          <View style={styles.newsSection}>
            {news.map((item, idx) => {
              const isHero = idx === 0;
              return (
                <PressableScale
                  key={item.id}
                  accessibilityRole="button"
                  haptic="light"
                  scaleTo={0.985}
                  onPress={() => router.push(`/news/${item.id}` as never)}
                  style={[
                    styles.newsCard,
                    isHero
                      ? { backgroundColor: ui.ink, borderColor: 'rgba(200, 255, 59, 0.25)' }
                      : { backgroundColor: ui.card, borderColor: ui.separator },
                  ]}>
                  <Image
                    source={item.image}
                    style={[styles.newsImage, { height: isHero ? 208 : 144 }]}
                    contentFit="cover"
                  />
                  <View style={styles.newsBody}>
                    <Text
                      style={[
                        styles.newsCategory,
                        { color: isHero ? ui.lime : ui.accent },
                      ]}>
                      {item.category.toUpperCase()} · {item.readMins} MIN READ
                    </Text>
                    <Text
                      style={[
                        styles.newsCardTitle,
                        { color: isHero ? ui.inkForeground : ui.label },
                      ]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.newsExcerpt,
                        { color: isHero ? ui.inkMuted : ui.secondaryLabel },
                      ]}
                      numberOfLines={3}>
                      {item.excerpt}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        )}
      </ScrollView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
  },
  logoWrap: {
    flex: 1,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 10,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabPillText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  unseenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  storiesRail: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 14,
  },
  storyItem: {
    width: 68,
    alignItems: 'center',
    gap: 6,
  },
  storyAddCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRingWrapper: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRingGradient: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2.5,
  },
  storyRingHole: {
    width: 61,
    height: 61,
    borderRadius: 30.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
  },
  storyInitials: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 18,
  },
  storyName: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 11,
    textAlign: 'center',
  },
  composerCard: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...continuous,
  },
  composerAvatarWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerAvatarText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  composerPrompt: {
    flex: 1,
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
  },
  composerPostPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  composerPostText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 12,
  },
  myPostCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  myPostHeader: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  myPostText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 15,
    lineHeight: 21,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 14,
  },
  pickedSection: {
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  pickedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  pickedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickedTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  shopAllLink: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  pickedScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pickedItem: {
    width: 150,
  },
  caughtUpWrap: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  caughtUpText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  dropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: 'space-between',
    rowGap: 18,
  },
  dropColumn: {
    width: '48%',
  },
  newsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  newsCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  newsImage: {
    width: '100%',
  },
  newsBody: {
    padding: 16,
    gap: 6,
  },
  newsCategory: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  newsCardTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    lineHeight: 23,
  },
  newsExcerpt: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
