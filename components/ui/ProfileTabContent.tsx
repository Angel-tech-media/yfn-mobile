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
  // If user has reposts but no original posts, automatically land on reposts tab so they see their activity
  const defaultTab: TabKey = posts.length === 0 && (reposts.length > 0 || repostedPosts.length > 0) ? 'reposts' : 'posts';
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  // Default to 'product' if user has product reposts
  const [repostType, setRepostType] = useState<'post' | 'product'>(reposts.length > 0 ? 'product' : 'post');

  return (
    <>
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={['posts', 'products', 'reposts']} />

      <View style={{ marginTop: spacing['4'] }}>
        {activeTab === 'posts' && (
          <>
            <Text style={styles.sectionTitlePadded}>My Posts</Text>
            {posts.length ? (
              <View style={styles.grid}>
                {posts.map((post, idx) => (
                  <PostTile key={post.id ? `post-${post.id}-${idx}` : `post-${idx}`} post={post} />
                ))}
              </View>
            ) : (
              <View style={styles.padded}>
                <EmptyState
                  icon="images-outline"
                  title="No posts yet"
                  actionText={reposts.length > 0 ? `View Reposted Products (${reposts.length})` : undefined}
                  onAction={() => {
                    setActiveTab('reposts');
                    setRepostType('product');
                  }}
                />
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
                    {products.map((product, idx) => (
                      <ProductTile key={product.id ? `prod-${product.id}-${idx}` : `prod-${idx}`} product={product} />
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
                <EmptyState
                  icon="cube-outline"
                  title="No store products"
                  subtitle="You are a buyer. Check your reposted products to see items you share."
                  actionText={reposts.length > 0 ? `View Reposts (${reposts.length})` : undefined}
                  onAction={() => {
                    setActiveTab('reposts');
                    setRepostType('product');
                  }}
                />
              </View>
            )}
          </>
        )}

        {activeTab === 'reposts' && (
          <View style={{ zIndex: 10 }}>
            <View style={styles.repostSegmentRow}>
              <Pressable
                onPress={() => setRepostType('product')}
                style={[styles.repostSegmentBtn, repostType === 'product' && styles.repostSegmentBtnActive]}>
                <Ionicons
                  name="cube-outline"
                  size={16}
                  color={repostType === 'product' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                />
                <Text
                  style={[
                    styles.repostSegmentText,
                    repostType === 'product' && styles.repostSegmentTextActive,
                  ]}>
                  Products ({reposts.length})
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRepostType('post')}
                style={[styles.repostSegmentBtn, repostType === 'post' && styles.repostSegmentBtnActive]}>
                <Ionicons
                  name="images-outline"
                  size={16}
                  color={repostType === 'post' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                />
                <Text
                  style={[
                    styles.repostSegmentText,
                    repostType === 'post' && styles.repostSegmentTextActive,
                  ]}>
                  Posts ({repostedPosts.length})
                </Text>
              </Pressable>
            </View>

            {repostType === 'product' ? (
              reposts.length ? (
                <View style={styles.grid}>
                  {reposts.map((repost, idx) => (
                    <RepostTile key={repost.id ? `repost-${repost.id}-${idx}` : `repost-${idx}`} repost={repost} handle={handle} />
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
                  {repostedPosts.map((post, idx) => (
                    <PostTile key={post.id ? `repost-post-${post.id}-${idx}` : `repost-post-${idx}`} post={post} isRepost />
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
  const imageUrl = repost.productImage;

  return (
    <Pressable
      onPress={() => router.push(`/product/${repost.productId}?via=${handle}` as never)}
      style={styles.tile}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.tileImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.tileImage} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.tileBadge, { backgroundColor: palette.brand.orange }]}>
        <Ionicons name="repeat" size={12} color="#fff" />
      </View>
      <View style={styles.tileMeta}>
        <Text style={styles.tilePrice} numberOfLines={1}>
          {repost.productPrice ? formatKobo(repost.productPrice) : (repost.productName || 'Product')}
        </Text>
        <Text style={styles.tileCategory} numberOfLines={1}>
          {repost.productName || `${repost.clicks} clicks · ${repost.conversions} sales`}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={30} color={palette.ink.onDarkMuted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySub}>{subtitle}</Text> : null}
      {actionText && onAction ? (
        <Pressable onPress={onAction} style={styles.emptyActionBtn}>
          <Text style={styles.emptyActionText}>{actionText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitlePadded: {
    ...typography.h2,
    color: '#FFFFFF',
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
    backgroundColor: '#140D08',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  tileMeta: { position: 'absolute', bottom: 8, left: 8, right: 8, gap: 1 },
  tilePrice: { ...typography.bodyEmphasis, color: '#fff', fontSize: 13 },
  tileCategory: { ...typography.caption, color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  empty: {
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['5'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyTitle: { ...typography.bodyEmphasis, color: '#FFFFFF' },
  emptySub: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 240,
  },
  emptyActionBtn: {
    marginTop: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.brand.orange,
  },
  emptyActionText: {
    ...typography.buttonLabel,
    fontSize: 13,
    color: '#FFFFFF',
  },
  repostSegmentRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['3'],
  },
  repostSegmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  repostSegmentBtnActive: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
  repostSegmentText: {
    ...typography.caption,
    fontFamily: typography.bodyEmphasis.fontFamily,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  repostSegmentTextActive: {
    color: '#FFFFFF',
  },
});
