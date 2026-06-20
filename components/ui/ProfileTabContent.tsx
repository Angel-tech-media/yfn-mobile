import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { ProfileTabs, type TabKey } from '@/components/ui/ProfileTabs';
import { RepostTypeDropdown } from '@/components/ui/RepostTypeDropdown';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';
import { useMe } from '@/src/api/account/hooks';
import type { Post, RankedProduct, Repost } from '@/src/api/types';

export interface ProfileTabContentProps {
  handle: string;
  posts: Post[];
  products: RankedProduct[];
  reposts: Repost[];
  repostedPosts: Post[];
  vendorCategory?: string;
  hasStore?: boolean;
}

export function ProfileTabContent({
  handle,
  posts,
  products,
  reposts,
  repostedPosts,
  vendorCategory,
  hasStore,
}: ProfileTabContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const [repostType, setRepostType] = useState<'post' | 'product'>('post');

  return (
    <>
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={['posts', 'products', 'reposts']} />

      <View style={{ marginTop: spacing['4'] }}>
        {activeTab === 'posts' && (
          <>
            <Text style={styles.sectionTitlePadded}>My Posts</Text>
            {posts.length ? (
              <View style={styles.grid}>
                {posts.map((post) => (
                  <PostTile key={post.id} post={post} />
                ))}
              </View>
            ) : (
              <View style={styles.padded}>
                <EmptyState icon="images-outline" title="No posts yet" />
              </View>
            )}
          </>
        )}

        {activeTab === 'products' && (
          <>
            {hasStore || vendorCategory ? (
              <>
                <Text style={styles.sectionTitlePadded}>Products</Text>
                {products.length ? (
                  <View style={styles.grid}>
                    {products.map((product) => (
                      <ProductTile key={product.id} product={product} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.padded}>
                    <EmptyState icon="cube-outline" title="No products yet" />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.padded}>
                <EmptyState icon="cube-outline" title="No products available" />
              </View>
            )}
          </>
        )}

        {activeTab === 'reposts' && (
          <View style={{ zIndex: 10 }}>
            <RepostTypeDropdown
              value={repostType}
              onChange={(type) => setRepostType(type)}
            />

            {repostType === 'product' ? (
              reposts.length ? (
                <View style={styles.grid}>
                  {reposts.map((repost) => (
                    <RepostTile key={repost.id} repost={repost} handle={handle} />
                  ))}
                </View>
              ) : (
                <View style={styles.padded}>
                  <EmptyState icon="cube-outline" title="No product reposts yet" />
                </View>
              )
            ) : (
              repostedPosts.length ? (
                <View style={styles.grid}>
                  {repostedPosts.map((post) => (
                    <PostTile key={post.id} post={post} isRepost />
                  ))}
                </View>
              ) : (
                <View style={styles.padded}>
                  <EmptyState icon="images-outline" title="No reposted posts yet" />
                </View>
              )
            )}
          </View>
        )}
      </View>
    </>
  );
}

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 4) / 3;

function PostTile({ post, isRepost }: { post: Post; isRepost?: boolean }) {
  const imageUrl = post.imageUrls?.[0];
  const { data: me } = useMe();
  const isMine = post.author.id === me?.id;

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
      {isRepost && (
        <View style={styles.tileBadge}>
          <Ionicons name="repeat" size={14} color="#fff" />
        </View>
      )}
      {!isMine && (
        <View style={styles.tileMeta}>
          <Text style={styles.tilePrice} numberOfLines={1}>@{post.author.handle}</Text>
        </View>
      )}
    </Pressable>
  );
}

function ProductTile({ product }: { product: RankedProduct }) {
  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}` as never)}
      style={styles.tile}>
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

function RepostTile({ repost, handle }: { repost: Repost; handle: string }) {
  return (
    <Pressable
      onPress={() => router.push(`/product/${repost.productId}?via=${handle}` as never)}
      style={styles.tile}>
      <LinearGradient colors={['#3a2818', '#1f1108']} style={StyleSheet.absoluteFill} />
      <View style={[styles.tileBadge, { backgroundColor: palette.brand.orange }]}>
        <Ionicons name="repeat" size={12} color="#fff" />
      </View>
      <View style={styles.tileMeta}>
        <Text style={styles.tilePrice}>+{formatKobo(repost.earnings)}</Text>
        <Text style={styles.tileCategory} numberOfLines={1}>
          {repost.clicks} clicks · {repost.conversions} sales
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyState({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={30} color={palette.ink.onDarkMuted} />
      <Text style={styles.emptyTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitlePadded: {
    ...typography.h2,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['4'],
  },
  padded: { paddingHorizontal: spacing['5'] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 2,
  },
  tile: {
    width: TILE_SIZE,
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  tileImage: { width: '100%', height: '100%' },
  tileBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileMeta: { position: 'absolute', bottom: 8, left: 8, right: 8, gap: 1 },
  tilePrice: { ...typography.bodyEmphasis, color: '#fff', fontSize: 13 },
  tileCategory: { ...typography.caption, color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  empty: {
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['5'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  emptyTitle: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
});
