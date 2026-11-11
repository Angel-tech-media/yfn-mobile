import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Badge, Chip } from '@/components/kit/Chip';
import { NavIconButton } from '@/components/kit/Fields';
import { LargeTitleHeader, SectionHeader } from '@/components/kit/Header';
import { PostCard, type PostItem } from '@/components/feed/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { useMe } from '@/src/api/account/hooks';
import { useConversations } from '@/src/api/chat/hooks';
import { useFeed, useFeedReels, useStoriesInbox } from '@/src/api/feed/hooks';
import { useCartCount } from '@/src/store/cart';
import { plasma } from '@/src/theme/plasma';
import { continuous, corner, layout, solidBackground, type, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

import type { Post, Story } from '@/src/api/types';

export default function HomeFeedScreen() {
  const ui = useUi();
  const { data, isError, isFetching, refetch } = useFeed({ limit: 30 });
  const { data: storiesData = [], refetch: refetchStories } = useStoriesInbox();
  const { data: reels = [], refetch: refetchReels } = useFeedReels({ limit: 10 });
  const { data: me } = useMe();
  const { data: threads = [] } = useConversations();
  const cartCount = useCartCount();
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = threads.filter((t) => {
    const mine = t.participants?.find((p) => p.userId === me?.id);
    if (!mine) return false;
    if (!mine.lastReadAt) return true;
    return new Date(t.updatedAt).getTime() > new Date(mine.lastReadAt).getTime();
  }).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchStories(), refetchReels()]);
    setRefreshing(false);
  }, [refetch, refetchStories, refetchReels]);

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
        title="Home"
        trailing={
          <>
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
                    <Text style={[type.subhead, { color: '#FFF', fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
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
          {posts.map((post, idx) => (
            <PostCard key={post.id ? `post-${post.id}` : `post-${idx}`} post={post} />
          ))}
        </View>
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
      .join('') || 'Y'
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, gap: layout.sectionGap },
  stories: { paddingHorizontal: layout.gutter, gap: 14 },
  story: { width: 72, alignItems: 'center', gap: 6 },
  storyRingWrapper: {
    shadowColor: '#C94124',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
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
  posts: { paddingHorizontal: layout.gutter, gap: 20 },
  empty: { alignItems: 'center', gap: 12, padding: 32 },
});
