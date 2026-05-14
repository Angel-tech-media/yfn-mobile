import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlurView } from 'expo-blur';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RepostSheet } from '@/components/ui/RepostSheet';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import {
  useEngagement,
  useIsLiked,
  useIsReposted,
  useIsSaved,
} from '@/src/store/engagement';
import { useUserContent } from '@/src/store/user-content';
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
  { key: 'add', name: 'Your story', isAdd: true },
  { key: 's1', name: 'Olufemi', avatar: STORY_AVATARS[0] },
  { key: 's2', name: 'Adaeze', avatar: STORY_AVATARS[1] },
  { key: 's3', name: 'Mide', avatar: STORY_AVATARS[2] },
  { key: 's4', name: 'Doyin', avatar: STORY_AVATARS[3] },
  { key: 's5', name: 'Tola', avatar: STORY_AVATARS[4] },
  { key: 's6', name: 'Bisi', avatar: STORY_AVATARS[5] },
  { key: 's7', name: 'Chioma', avatar: STORY_AVATARS[0] },
  { key: 's8', name: 'Tunde', avatar: STORY_AVATARS[1] },
  { key: 's9', name: 'Aisha', avatar: STORY_AVATARS[2] },
  { key: 's10', name: 'Kemi', avatar: STORY_AVATARS[3] },
  { key: 's11', name: 'Ifeanyi', avatar: STORY_AVATARS[4] },
  { key: 's12', name: 'Sade', avatar: STORY_AVATARS[5] },
  { key: 's13', name: 'Yetunde', avatar: STORY_AVATARS[0] },
  { key: 's14', name: 'Femi', avatar: STORY_AVATARS[1] },
  { key: 's15', name: 'Zainab', avatar: STORY_AVATARS[2] },
  { key: 's16', name: 'Ekene', avatar: STORY_AVATARS[3] },
  { key: 's17', name: 'Halima', avatar: STORY_AVATARS[4] },
  { key: 's18', name: 'Damilola', avatar: STORY_AVATARS[5] },
  { key: 's19', name: 'Chinedu', avatar: STORY_AVATARS[0] },
  { key: 's20', name: 'Folake', avatar: STORY_AVATARS[1] },
  { key: 's21', name: 'Emeka', avatar: STORY_AVATARS[2] },
  { key: 's22', name: 'Ngozi', avatar: STORY_AVATARS[3] },
];

type PostItem = {
  kind: 'post';
  id: string;
  author: string;
  badge: boolean;
  caption: string;
  product: string;
  price: string;
  oldPrice: string;
};

type RepostItem = {
  kind: 'repost';
  id: string;
  reposter: { name: string; handle: string; avatarIdx: number };
  quote?: string;
  vendor: { name: string; handle: string; badge: boolean; avatarIdx: number };
  product: { id: string; name: string; price: string; oldPrice: string };
};

type FeedItem = PostItem | RepostItem;

const FEED_POSTS: FeedItem[] = [
  {
    kind: 'post',
    id: 'p1',
    author: 'Aisha Threads',
    badge: true,
    caption:
      'New drop · The Lagos Heat capsule. Limited run, hand-embroidered Ankara with a fitted silhouette. Booking 3-day delivery.',
    product: 'Ankara high shoulder fitted gown',
    price: '₦24,990',
    oldPrice: '₦26,250',
  },
  {
    kind: 'post',
    id: 'p2',
    author: "Sarah's Boutique",
    badge: true,
    caption:
      'Two-piece season is here. Comfortable, breathable, made for the Lagos commute. Drop your size below — restocked all weekend.',
    product: 'Office two-piece set',
    price: '₦27,000',
    oldPrice: '₦31,500',
  },
  {
    kind: 'post',
    id: 'p3',
    author: 'GadgetFix Hub',
    badge: true,
    caption:
      'iPhone 14 screens back in stock. Same-day fit, 6-month warranty. Walk-in to the VI studio or book a courier.',
    product: 'iPhone 14 screen replacement',
    price: '₦45,000',
    oldPrice: '₦52,000',
  },
  {
    kind: 'post',
    id: 'p4',
    author: 'Zara Cakes',
    badge: false,
    caption:
      'Custom birthday cake commissioned for @miide_x — 3 tiers, marble fondant, edible gold leaf. Order 48h ahead.',
    product: 'Three-tier celebration cake',
    price: '₦42,000',
    oldPrice: '₦48,000',
  },
  {
    kind: 'post',
    id: 'p5',
    author: 'Mide Studios',
    badge: true,
    caption:
      'Portrait session for Detty December. 1-hour shoot, 20 edited photos, choose studio or location. Slots filling fast.',
    product: 'Festival portrait session',
    price: '₦65,000',
    oldPrice: '₦80,000',
  },
  {
    kind: 'post',
    id: 'p6',
    author: 'Janet Ogborini',
    badge: true,
    caption:
      'When confidence speaks louder than words. Restocking the camel-suede number after the weekend rush — secure yours now.',
    product: 'Camel-suede heeled boots',
    price: '₦38,500',
    oldPrice: '₦44,000',
  },
  {
    kind: 'post',
    id: 'p7',
    author: 'Beauty by Femi',
    badge: true,
    caption:
      'Hydration kit · 5-step routine featured in last week\'s Vibe Style. Shipping nationwide, free above ₦20K.',
    product: 'Glow hydration kit',
    price: '₦18,990',
    oldPrice: '₦22,500',
  },
  {
    kind: 'repost',
    id: 'rp8',
    reposter: { name: 'Olufemi Adekoya', handle: 'olufemia', avatarIdx: 0 },
    quote:
      'this gown is everything. Slid it on for the wedding last weekend, three people asked where I got it.',
    vendor: { name: 'Aisha Threads', handle: 'aishathreads', badge: true, avatarIdx: 1 },
    product: {
      id: 'p1',
      name: 'Ankara high shoulder fitted gown',
      price: '₦24,990',
      oldPrice: '₦26,250',
    },
  },
  {
    kind: 'post',
    id: 'p9',
    author: 'Tola Bakare',
    badge: true,
    caption:
      'New jersey drop — Super Eagles tribute capsule, Naija-tailored sizing. Pre-orders close Friday midnight.',
    product: 'Super Eagles tribute jersey',
    price: '₦14,500',
    oldPrice: '₦17,000',
  },
  {
    kind: 'post',
    id: 'p10',
    author: 'Doyin Ojo',
    badge: true,
    caption:
      'Saturday booking is OPEN. Bridal makeup, gele included. DM to lock your date — limited slots in December.',
    product: 'Bridal makeup + gele',
    price: '₦95,000',
    oldPrice: '₦120,000',
  },
  {
    kind: 'post',
    id: 'p11',
    author: 'Chioma Interiors',
    badge: false,
    caption:
      'Velvet ottoman pair — emerald, brand new. Going at clearance price because we are flipping the studio next month.',
    product: 'Emerald velvet ottoman (pair)',
    price: '₦88,000',
    oldPrice: '₦115,000',
  },
  {
    kind: 'repost',
    id: 'rp11',
    reposter: { name: 'Bisi Akande', handle: 'bisi_a', avatarIdx: 5 },
    vendor: { name: 'Tola Bakare', handle: 'tolathreads', badge: true, avatarIdx: 4 },
    product: {
      id: 'r6',
      name: 'Super Eagles tribute jersey',
      price: '₦14,500',
      oldPrice: '₦17,000',
    },
  },
  {
    kind: 'post',
    id: 'p12',
    author: 'Tunde Otun',
    badge: true,
    caption:
      'Photography drop — Lagos rooftops series. Print + digital bundle, signed, edition of 10.',
    product: 'Lagos rooftops print bundle',
    price: '₦52,000',
    oldPrice: '₦65,000',
  },
];

export default function HomeFeedScreen() {
  const userPosts = useUserContent((s) => s.posts);
  const userStories = useUserContent((s) => s.stories);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a network refetch — real impl would call walletApi/feedApi
    setTimeout(() => setRefreshing(false), 900);
  }, []);

  // Prepend user-created stories after the "Add Story" tile.
  const STORIES_VIEW = [
    STORIES[0],
    ...userStories.map((s) => ({
      key: s.id,
      name: 'You',
      avatar: s.image as ImageSourcePropType,
    })),
    ...STORIES.slice(1),
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
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
            {userPosts.map((p, i) => (
              <FeedCard
                key={p.id}
                idx={i}
                post={{
                  kind: 'post',
                  id: p.id,
                  author: 'David Okpo',
                  badge: true,
                  caption: p.caption,
                  product: '',
                  price: '',
                  oldPrice: '',
                }}
              />
            ))}
            {FEED_POSTS.map((item, i) =>
              item.kind === 'repost' ? (
                <RepostFeedCard key={item.id} item={item} />
              ) : (
                <FeedCard key={item.id} post={item} idx={userPosts.length + i} />
              )
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function FeedCard({ post, idx }: { post: PostItem; idx: number }) {
  const liked = useIsLiked(post.id);
  const saved = useIsSaved(post.id);
  const reposted = useIsReposted(post.id);
  const toggleLike = useEngagement((s) => s.toggleLike);
  const toggleSave = useEngagement((s) => s.toggleSave);
  const [repostOpen, setRepostOpen] = useState(false);

  const authorHandle = post.author.toLowerCase().replace(/['\s]+/g, '');

  return (
    <View style={styles.cardWrap}>
      <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
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
          vendorId: post.author.toLowerCase().replace(/\s+/g, ''),
        }}
      />

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
    </View>
  );
}

function RepostFeedCard({ item }: { item: RepostItem }) {
  const liked = useIsLiked(item.id);
  const saved = useIsSaved(item.id);
  const reposted = useIsReposted(item.product.id);
  const toggleLike = useEngagement((s) => s.toggleLike);
  const toggleSave = useEngagement((s) => s.toggleSave);
  const [repostOpen, setRepostOpen] = useState(false);

  return (
    <View style={styles.cardWrap}>
      <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        {/* Reposter row */}
        <View style={styles.repostHeader}>
          <Pressable onPress={() => router.push(`/u/${item.reposter.handle}` as never)}>
            <Avatar size={28} source={STORY_AVATARS[item.reposter.avatarIdx % STORY_AVATARS.length]} />
          </Pressable>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => router.push(`/u/${item.reposter.handle}` as never)}>
            <View style={styles.repostHeaderText}>
              <Ionicons name="repeat" size={14} color={palette.brand.orange} />
              <Text style={styles.repostHeaderName}>{item.reposter.name}</Text>
              <Text style={styles.repostHeaderVerb}>reposted</Text>
            </View>
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color={palette.ink.onDarkSoft} />
          </Pressable>
        </View>

        {item.quote ? (
          <Text style={styles.repostQuote} numberOfLines={3}>
            "{item.quote}"
          </Text>
        ) : null}

        {/* Embedded vendor card */}
        <Pressable
          onPress={() =>
            router.push(`/product/${item.product.id}?via=${item.reposter.handle}` as never)
          }
          style={styles.embeddedVendor}>
          <View style={styles.embeddedHeader}>
            <Avatar size={28} source={STORY_AVATARS[item.vendor.avatarIdx % STORY_AVATARS.length]} />
            <View style={styles.embeddedNameRow}>
              <Text style={styles.embeddedVendorName}>{item.vendor.name}</Text>
              {item.vendor.badge ? <VerifiedCheck tone="success" size={12} /> : null}
            </View>
          </View>
          <Image source={PRODUCT_IMAGE} style={styles.embeddedImage} contentFit="cover" />
        </Pressable>

        {/* Engagement row — applies to the repost */}
        <View style={styles.engagementRow}>
          <Pressable onPress={() => toggleLike(item.id)} hitSlop={6} style={styles.engageBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#FF3B47' : palette.ink.onDarkStrong}
            />
            <Text style={styles.engageCount}>{liked ? '342' : '341'}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/post/${item.id}/comments` as never)}
            hitSlop={6}
            style={styles.engageBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={palette.ink.onDarkStrong} />
            <Text style={styles.engageCount}>22</Text>
          </Pressable>
          <Pressable onPress={() => setRepostOpen(true)} hitSlop={6} style={styles.engageBtn}>
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
          <Pressable onPress={() => toggleSave(item.id)} hitSlop={6}>
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
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            vendor: item.vendor.name,
            vendorId: item.vendor.handle,
          }}
        />

        <View style={styles.cardFooter}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{item.product.price}</Text>
              <Text style={styles.oldPrice}>{item.product.oldPrice}</Text>
            </View>
          </View>
          <PrimaryButton
            label="Buy now"
            onPress={() =>
              router.push(`/product/${item.product.id}?via=${item.reposter.handle}` as never)
            }
            style={styles.buyBtn}
          />
        </View>
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
  heroImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
