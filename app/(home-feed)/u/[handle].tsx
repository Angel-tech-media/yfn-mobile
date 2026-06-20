import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useMe } from '@/src/api/account/hooks';
import { useBlockUser, useFollowVendor, useUserPosts, useVendor, useVendorProducts, useVendorReviews } from '@/src/api/vendors/hooks';
import type { Post, RankedProduct } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

export default function PublicProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const userHandle = String(handle ?? '');
  const { data: vendor, isError, isLoading, refetch } = useVendor(userHandle);
  const { data: products = [] } = useVendorProducts(userHandle);
  const { data: reviews = [] } = useVendorReviews(userHandle);
  const { data: postsData } = useUserPosts(userHandle);
  const posts = postsData?.items ?? [];
  const followVendor = useFollowVendor();
  const blockUser = useBlockUser();
  const { data: me } = useMe();
  const isMe = me?.username === userHandle || me?.handle === userHandle;

  const handleOptions = () => {
    Alert.alert(
      'Profile Options',
      `What would you like to do with @${userHandle}?`,
      [
        {
          text: 'Block User',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Block User',
              `Are you sure you want to block @${userHandle}? You won't be able to see their content or interact with them.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Block',
                  style: 'destructive',
                  onPress: () => {
                    blockUser.mutate(userHandle, {
                      onSuccess: () => {
                        Alert.alert('Blocked', `@${userHandle} has been blocked.`);
                        router.back();
                      },
                    });
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.headerTitle}>@{userHandle}</Text>
          {!isMe ? (
            <Pressable onPress={handleOptions} hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color={palette.ink.onDarkStrong} />
            </Pressable>
          ) : (
            <View style={{ width: 20 }} />
          )}
        </View>

        {isLoading ? (
          <StateView label="Loading profile..." />
        ) : isError || !vendor ? (
          <StateView label="Profile unavailable." onRetry={() => refetch()} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.profileTop}>
              <Avatar size={88} initials={initialsFor(vendor.storeName || vendor.name)} />
              <View style={styles.statsRow}>
                <Stat value={compact(vendor.posts ?? products.length)} label="Posts" />
                <Stat value={compact(vendor.followers ?? 0)} label="Followers" />
                <Stat value={compact(vendor.following ?? 0)} label="Following" />
              </View>
            </View>

            <View style={styles.identity}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{vendor.storeName || vendor.name}</Text>
                {vendor.verified ? <VerifiedCheck tone="success" size={15} /> : null}
              </View>
              <Text style={styles.handle}>@{vendor.handle}</Text>
              {vendor.about ? <Text style={styles.bio}>{vendor.about}</Text> : null}
              {vendor.address ? <Text style={styles.linkText}>{vendor.address}</Text> : null}
            </View>

            <View style={styles.metaRow}>
              <Meta icon="star" text={`${vendor.rating.toFixed(1)} (${vendor.reviews})`} />
              <Meta icon={vendor.open ? 'time' : 'moon'} text={vendor.open ? 'Open' : 'Closed'} />
              {vendor.category ? <Meta icon="pricetag" text={vendor.category} /> : null}
            </View>

            <View style={styles.actions}>
              {isMe ? (
                <Pressable
                  onPress={() => router.push('/account/edit')}
                  style={[styles.actionBtn, styles.actionPrimary]}>
                  <Text style={styles.actionPrimaryText}>Edit Profile</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={() => followVendor.mutate(vendor.handle)}
                    disabled={followVendor.isPending}
                    style={[styles.actionBtn, styles.actionPrimary]}>
                    <Text style={styles.actionPrimaryText}>
                      {vendor.isFollowing ? 'Following' : followVendor.isPending ? 'Following...' : 'Follow'}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.actionBtn}>
                    <Text style={styles.actionText}>Message</Text>
                  </Pressable>
                </>
              )}
              <Pressable onPress={() => router.push(`/place/${vendor.handle}` as never)} style={styles.iconAction}>
                <Ionicons name="location-outline" size={17} color={palette.ink.onDarkStrong} />
              </Pressable>
            </View>

            {vendor.category ? (
              <>
                <Text style={styles.sectionTitle}>Products</Text>
                {products.length ? (
                  <View style={styles.grid}>
                    {products.map((product) => (
                      <ProductTile key={product.id} product={product} />
                    ))}
                  </View>
                ) : (
                  <EmptyState label="No products yet." />
                )}

                <Text style={styles.sectionTitle}>Reviews</Text>
                {reviews.length ? (
                  <View style={styles.reviewList}>
                    {reviews.slice(0, 4).map((review) => (
                      <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <Text style={styles.reviewAuthor}>{review.author}</Text>
                          <Text style={styles.reviewRating}>{review.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.reviewText}>{review.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState label="No reviews yet." />
                )}
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Posts</Text>
            {posts.length ? (
              <View style={styles.grid}>
                {posts.map((post) => (
                  <PostTile key={post.id} post={post} />
                ))}
              </View>
            ) : (
              <EmptyState label="No posts yet." />
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </EspressoBackground>
  );
}

function StateView({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.stateText}>{label}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProductTile({ product }: { product: RankedProduct }) {
  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  return (
    <Pressable onPress={() => router.push(`/product/${product.id}` as never)} style={styles.tile}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.tileImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.tileImage} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} locations={[0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.tileMeta}>
        <Text style={styles.tilePrice}>{formatKobo(product.price)}</Text>
        <Text style={styles.tileCategory} numberOfLines={1}>{product.category}</Text>
      </View>
    </Pressable>
  );
}

function PostTile({ post }: { post: Post }) {
  const imageUrl = post.imageUrls?.[0];

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}` as never)}
      style={styles.tile}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.tileImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.tileImage} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} locations={[0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.tileMeta}>
        <Text style={styles.tilePrice} numberOfLines={1}>@{post.author.handle}</Text>
      </View>
    </Pressable>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={13} color={palette.brand.orange} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  headerTitle: { ...typography.title, color: palette.ink.onDarkStrong },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  stateText: { ...typography.body, color: palette.ink.onDarkSoft },
  retryBtn: {
    height: 36,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  scroll: { paddingHorizontal: spacing['5'], paddingBottom: 100, gap: spacing['3'] },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: spacing['4'] },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { ...typography.h2, color: palette.ink.onDarkStrong },
  statLabel: { ...typography.caption, color: palette.ink.onDarkMuted },
  identity: { gap: spacing['1'] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  name: { ...typography.title, color: palette.ink.onDarkStrong },
  handle: { ...typography.caption, color: palette.ink.onDarkMuted },
  bio: { ...typography.body, color: palette.ink.onDarkSoft },
  linkText: { ...typography.bodyEmphasis, color: palette.brand.orange },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  metaText: { ...typography.caption, color: palette.ink.onDarkStrong },
  actions: { flexDirection: 'row', gap: spacing['2'] },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  actionPrimary: { backgroundColor: palette.brand.orange, borderColor: palette.brand.orange },
  actionText: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  actionPrimaryText: { ...typography.bodyEmphasis, color: '#fff' },
  iconAction: {
    width: 38,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  sectionTitle: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong, marginTop: spacing['3'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  tile: { width: '33.2%', aspectRatio: 1, overflow: 'hidden' },
  tileImage: { width: '100%', height: '100%' },
  tileMeta: { position: 'absolute', bottom: 8, left: 8, right: 8, gap: 1 },
  tilePrice: { ...typography.bodyEmphasis, color: '#fff', fontSize: 13 },
  tileCategory: { ...typography.caption, color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  empty: {
    padding: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  emptyText: { ...typography.body, color: palette.ink.onDarkMuted, textAlign: 'center' },
  reviewList: { gap: spacing['2'] },
  reviewCard: {
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: spacing['1'],
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewAuthor: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  reviewRating: { ...typography.bodyEmphasis, color: palette.brand.orange },
  reviewText: { ...typography.body, color: palette.ink.onDarkSoft },
});
