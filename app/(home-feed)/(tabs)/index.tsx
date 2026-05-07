import { Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useEngagement, useIsLiked, useIsSaved } from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

const STORY_AVATARS: ImageSourcePropType[] = [
  require('@/assets/figma/story-1.png'),
  require('@/assets/figma/story-2.png'),
  require('@/assets/figma/story-3.png'),
  require('@/assets/figma/story-4.png'),
  require('@/assets/figma/story-5.png'),
  require('@/assets/figma/story-6.png'),
];

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const SELF_AVATAR = require('@/assets/figma/store-avatar.png');

const STORIES: Array<{ key: string; name: string; isAdd?: boolean; avatar?: ImageSourcePropType }> = [
  { key: 'add', name: 'Add Story', isAdd: true },
  { key: 's1', name: 'Olufemi', avatar: STORY_AVATARS[0] },
  { key: 's2', name: 'Adaeze', avatar: STORY_AVATARS[1] },
  { key: 's3', name: 'Mide', avatar: STORY_AVATARS[2] },
  { key: 's4', name: 'Doyin', avatar: STORY_AVATARS[3] },
  { key: 's5', name: 'Tola', avatar: STORY_AVATARS[4] },
];

const FEED_POSTS = [
  {
    id: 'p1',
    author: 'Oludayo Odukoya',
    badge: true,
    caption:
      'When confidence speaks louder than words. It reveals more than just a portrait. It offers a vivid glimpse into the journey…',
    product: 'Ankara high shoulder fitted gown',
    price: '₦24,990',
    oldPrice: '₦26,250',
  },
  {
    id: 'p2',
    author: 'Janet Ogborini',
    badge: true,
    caption:
      'When confidence speaks louder than words. It reveals more than just a portrait. It offers a vivid glimpse into the journey…',
    product: 'Ankara high shoulder fitted gown',
    price: '₦24,990',
    oldPrice: '₦26,250',
  },
  {
    id: 'p3',
    author: 'Janet Ogborini',
    badge: true,
    caption:
      'When confidence speaks louder than words. It reveals more than just a portrait. It offers a vivid glimpse into the journey…',
    product: 'Ankara high shoulder fitted gown',
    price: '₦24,990',
    oldPrice: '₦26,250',
  },
];

export default function HomeFeedScreen() {
  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Feed</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Search"
              onPress={() => router.push('/search')}
              hitSlop={6}
              style={styles.notifBtn}>
              <Ionicons name="search" size={20} color={palette.ink.onDarkStrong} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              hitSlop={6}
              style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color={palette.ink.onDarkStrong} />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.profileBubble}>
              <Avatar size={32} initials="DO" />
              <View style={styles.statusDot} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          stickyHeaderIndices={[0]}>
          <View style={styles.storiesWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRow}>
              {STORIES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => !s.isAdd && router.push(`/story/${s.key}` as never)}
                  style={styles.storyTile}>
                  <View style={[styles.storyRing, s.isAdd && styles.storyRingAdd]}>
                    {s.isAdd ? (
                      <Ionicons name="add" size={22} color={palette.ink.onDarkStrong} />
                    ) : (
                      <Avatar size={56} source={s.avatar} />
                    )}
                  </View>
                  <Text style={styles.storyName} numberOfLines={1}>{s.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.feed}>
            {FEED_POSTS.map((post, i) => (
              <FeedCard key={post.id} post={post} idx={i} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function FeedCard({ post, idx }: { post: typeof FEED_POSTS[number]; idx: number }) {
  const liked = useIsLiked(post.id);
  const saved = useIsSaved(post.id);
  const toggleLike = useEngagement((s) => s.toggleLike);
  const toggleSave = useEngagement((s) => s.toggleSave);

  const authorHandle = post.author.toLowerCase().replace(/\s+/g, '-');

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Pressable onPress={() => router.push(`/u/${authorHandle}` as never)}>
          <Avatar size={36} source={STORY_AVATARS[idx % STORY_AVATARS.length]} />
        </Pressable>
        <Pressable
          style={styles.idBlock}
          onPress={() => router.push(`/u/${authorHandle}` as never)}>
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

      <Image source={PRODUCT_IMAGE} style={styles.heroImage} contentFit="cover" />

      <View style={styles.engagementRow}>
        <Pressable onPress={() => toggleLike(post.id)} hitSlop={6} style={styles.engageBtn}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={22}
            color={liked ? '#FF3B47' : palette.ink.onDarkStrong}
          />
          <Text style={styles.engageCount}>{liked ? '1.2K' : '1.1K'}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/post/${post.id}/comments` as never)}
          hitSlop={6}
          style={styles.engageBtn}>
          <Ionicons name="chatbubble-outline" size={22} color={palette.ink.onDarkStrong} />
          <Text style={styles.engageCount}>84</Text>
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

      <View style={styles.cardFooter}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{post.product}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{post.price}</Text>
            <Text style={styles.oldPrice}>{post.oldPrice}</Text>
          </View>
        </View>
        <PrimaryButton
          label="Buy now"
          onPress={() => router.push('/product/p1' as never)}
          style={styles.buyBtn}
        />
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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
    backgroundColor: palette.bg.espressoEnd,
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
  card: {
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
  heroImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
});
