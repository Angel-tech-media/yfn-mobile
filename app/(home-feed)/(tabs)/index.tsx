import { useCallback, useState } from 'react';

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RepostSheet } from '@/components/ui/RepostSheet';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useMe } from '@/src/api/account/hooks';
import { useFeed, useStoriesInbox } from '@/src/api/feed/hooks';
import {
  useEngagement,
  useIsLiked,
  useIsReposted,
  useIsSaved,
} from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

import { formatKobo } from '@/src/utils/money';

import type { MeResponse, Post, Story } from '@/src/api/types';

type StoryTile = { key: string; name: string; isAdd?: boolean; avatarUrl?: string | null };

type PostItem = {
  kind: 'post';
  id: string;
  author: string;
  authorHandle: string;
  authorAvatarUrl?: string | null;
  badge: boolean;
  caption: string;
  product: string;
  productId?: string;
  price: string;
  likes: number;
  comments: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  imageUrls: string[];
};

export default function HomeFeedScreen() {
  const { data, isError, isFetching, refetch } = useFeed({ limit: 30 });
  const { data: storiesData = [], refetch: refetchStories } = useStoriesInbox();
  const { data: me } = useMe();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchStories()]);
    setRefreshing(false);
  }, [refetch, refetchStories]);

  const feedPosts = data?.items.map(toPostItem) ?? [];
  const profileName = profileNameFor(me);
  const profileAvatar = profileAvatarFor(me);

  const STORIES_VIEW: StoryTile[] = [
    { key: 'add', name: 'Your story', isAdd: true },
    ...storiesData.map(toStoryTile),
  ];
  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Feed</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search people and hashtags"
              onPress={() => router.push('/search?focus=people')}
              hitSlop={6}
              style={styles.notifBtn}>
              <Ionicons name="search" size={20} color={palette.ink.onDarkStrong} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Messages"
              onPress={() => router.push('/inbox' as never)}
              hitSlop={6}
              style={styles.notifBtn}>
              <Ionicons name="paper-plane-outline" size={20} color={palette.ink.onDarkStrong} />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              hitSlop={6}
              style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color={palette.ink.onDarkStrong} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.push('/(tabs)/profile' as never)}
              style={styles.profileBubble}>
              <Avatar
                size={32}
                source={profileAvatar}
                initials={initialsFor(profileName)}
              />
              <View style={styles.statusDot} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isFetching}
              onRefresh={onRefresh}
              tintColor={palette.brand.orange}
              colors={[palette.brand.orange]}
            />
          }>
          <View style={styles.storiesWrap}>
            <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRow}>
              {STORIES_VIEW.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => router.push((s.isAdd ? '/create/story' : `/story/${s.key}`) as never)}
                  style={styles.storyTile}>
                  <View style={[styles.storyRing, s.isAdd && styles.storyRingAdd]}>
                    {s.isAdd ? (
                      <Ionicons name="add" size={22} color={palette.ink.onDarkStrong} />
                    ) : s.avatarUrl ? (
                      <Avatar size={56} source={{ uri: s.avatarUrl }} />
                    ) : (
                      <Avatar size={56} initials={initialsFor(s.name)} />
                    )}
                  </View>
                  <Text style={styles.storyName} numberOfLines={1}>{s.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.feed}>
            {isError ? (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedText}>Could not load feed from the backend.</Text>
                <PrimaryButton label="Retry" onPress={() => refetch()} style={styles.retryBtn} />
              </View>
            ) : null}
            {!isError && !feedPosts.length ? (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedText}>No feed posts yet.</Text>
              </View>
            ) : null}
            {feedPosts.map((item) => (
              <FeedCard key={item.id} post={item} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function toPostItem(item: Post): PostItem {
  return {
    kind: 'post',
    id: item.id,
    author: item.author.name,
    authorHandle: item.author.handle,
    authorAvatarUrl: item.author.avatarUrl,
    badge: !!item.author.verified,
    caption: item.caption,
    product: item.product?.name ?? '',
    productId: item.product?.id,
    price: item.product ? formatKobo(item.product.price) : '',
    likes: item.likes,
    comments: item.comments,
    likedByMe: item.likedByMe,
    savedByMe: item.savedByMe,
    imageUrls: item.imageUrls,
  };
}

function toStoryTile(story: Story): StoryTile {
  return {
    key: story.id,
    name: story.author.name,
    avatarUrl: story.author.avatarUrl,
  };
}

function profileNameFor(me?: MeResponse) {
  return me?.name || me?.displayName || me?.username || 'Me';
}

function profileAvatarFor(me?: MeResponse) {
  return me?.avatarUrl ? { uri: me.avatarUrl } : undefined;
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function FeedCard({ post }: { post: PostItem }) {
  const liked = useIsLiked(post.id) || !!post.likedByMe;
  const saved = useIsSaved(post.id) || !!post.savedByMe;
  const reposted = useIsReposted(post.id);
  const toggleLike = useEngagement((s) => s.toggleLike);
  const toggleSave = useEngagement((s) => s.toggleSave);
  const [repostOpen, setRepostOpen] = useState(false);

  return (
    <View style={styles.cardWrap}>
      <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Pressable onPress={() => router.push(`/u/${post.authorHandle}` as never)}>
          <Avatar
            size={36}
            source={post.authorAvatarUrl ? { uri: post.authorAvatarUrl } : undefined}
            initials={initialsFor(post.author)}
          />
        </Pressable>
        <Pressable
          style={styles.idBlock}
          onPress={() => router.push(`/u/${post.authorHandle}` as never)}>
          <View style={styles.nameRow}>
            <Text style={styles.author}>{post.author}</Text>
            {post.badge ? <VerifiedCheck tone="success" size={14} /> : null}
          </View>
        </Pressable>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={18} color={palette.ink.onDarkSoft} />
        </Pressable>
      </View>

      <Text style={styles.caption} numberOfLines={2}>{post.caption}</Text>

      {post.imageUrls.length ? (
        <PostCarousel imageUrls={post.imageUrls} />
      ) : (
        <View style={styles.heroImagePlaceholder}>
          <Ionicons name="image-outline" size={28} color={palette.ink.onDarkMuted} />
        </View>
      )}

      <View style={styles.engagementRow}>
        <Pressable onPress={() => toggleLike(post.id)} hitSlop={6} style={styles.engageBtn}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#FF3B47' : palette.ink.onDarkStrong}
          />
          <Text style={styles.engageCount}>{formatCompact(post.likes + (liked && !post.likedByMe ? 1 : 0))}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/post/${post.id}/comments` as never)}
          hitSlop={6}
          style={styles.engageBtn}>
          <Ionicons name="chatbubble-outline" size={22} color={palette.ink.onDarkStrong} />
          <Text style={styles.engageCount}>{formatCompact(post.comments)}</Text>
        </Pressable>
        <Pressable
          onPress={() => setRepostOpen(true)}
          hitSlop={6}
          style={styles.engageBtn}>
          <Ionicons
            name="repeat"
            size={22}
            color={reposted ? palette.brand.orange : palette.ink.onDarkStrong}
          />
          {reposted ? <Text style={styles.engageCount}>Reposted</Text> : null}
        </Pressable>
        <Pressable hitSlop={6} style={styles.engageBtn}>
          <Ionicons name="paper-plane-outline" size={22} color={palette.ink.onDarkStrong} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => toggleSave(post.id)} hitSlop={6}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? palette.brand.orange : palette.ink.onDarkStrong}
          />
        </Pressable>
      </View>

      <RepostSheet
        visible={repostOpen}
        onClose={() => setRepostOpen(false)}
        product={{
          id: post.id,
          name: post.product,
          price: post.price,
          vendor: post.author,
          vendorId: post.authorHandle,
        }}
      />

      {post.product ? (
        <View style={styles.cardFooter}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{post.product}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{post.price}</Text>
          </View>
        </View>
        <PrimaryButton
          label="Buy now"
          onPress={() => router.push(`/product/${post.productId ?? post.id}` as never)}
          style={styles.buyBtn}
        />
        </View>
      ) : null}
      </View>
    </View>
  );
}

function PostCarousel({ imageUrls }: { imageUrls: string[] }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const mediaWidth = Math.max(width - spacing['5'] * 2 - spacing['3'] * 2, 240);
  const hasMultiple = imageUrls.length > 1;

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / mediaWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), imageUrls.length - 1));
  };

  return (
    <View style={[styles.carouselFrame, { width: mediaWidth }]}>
      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}>
        {imageUrls.map((url, index) => (
          <Image
            key={`${url}-${index}`}
            source={{ uri: url }}
            style={[styles.carouselImage, { width: mediaWidth }]}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      {hasMultiple ? (
        <>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{activeIndex + 1}/{imageUrls.length}</Text>
          </View>
          <View style={styles.carouselDots}>
            {imageUrls.map((url, index) => (
              <View
                key={`${url}-dot-${index}`}
                style={[styles.carouselDot, index === activeIndex && styles.carouselDotActive]}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
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
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.brand.orange,
    borderWidth: 1.5,
    borderColor: palette.bg.espressoEnd,
  },
  profileBubble: {
    position: 'relative',
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    paddingTop: spacing['1'],
  },
  engageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  engageCount: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.brand.orange,
    borderWidth: 2,
    borderColor: palette.bg.espressoEnd,
  },
  scroll: {
    paddingBottom: 100,
  },
  storiesWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
  },
  storiesRow: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['3'],
    gap: spacing['3'],
  },
  storyTile: {
    alignItems: 'center',
    width: 64,
    gap: 4,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.brand.orange,
    padding: 2,
  },
  storyRingAdd: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.40)',
  },
  storyName: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkSoft,
  },
  feed: {
    paddingHorizontal: spacing['5'],
    gap: spacing['4'],
    paddingTop: spacing['3'],
  },
  emptyFeed: {
    gap: spacing['3'],
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  emptyFeedText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  retryBtn: {
    alignSelf: 'center',
    minWidth: 120,
  },
  cardWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.50)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: 'rgba(40, 26, 16, 0.18)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 4,
  },
  card: {
    padding: spacing['3'],
    gap: spacing['3'],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  idBlock: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  author: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  caption: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  carouselFrame: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  carouselImage: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  heroImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
  },
  imageCounterText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  carouselDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
  },
  carouselDotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  productInfo: { flex: 1 },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['2'],
    marginTop: 2,
  },
  price: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  oldPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
    textDecorationLine: 'line-through',
  },
  buyBtn: {
    height: 40,
    paddingHorizontal: spacing['4'],
  },
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  repostHeaderText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repostHeaderName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  repostHeaderVerb: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  repostQuote: {
    fontFamily: typography.body.fontFamily,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
    borderLeftWidth: 3,
    borderLeftColor: palette.brand.orange,
    paddingLeft: spacing['3'],
  },
  embeddedVendor: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
  embeddedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['2'],
  },
  embeddedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  embeddedVendorName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  embeddedImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});
