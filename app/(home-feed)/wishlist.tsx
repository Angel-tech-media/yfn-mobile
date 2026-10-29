import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProfileTabs, type TabKey } from '@/components/ui/ProfileTabs';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useCart } from '@/src/store/cart';
import { useWishlist, type WishlistItem } from '@/src/store/wishlist';
import { useMyBookmarkedPosts } from '@/src/api/feed/hooks';
import type { Post } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function WishlistScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const addCart = useCart((s) => s.add);

  const { data: bookmarkedPostsData } = useMyBookmarkedPosts();
  const bookmarkedPosts = bookmarkedPostsData?.items ?? [];

  const emptyProducts = items.length === 0;
  const emptyPosts = bookmarkedPosts.length === 0;

  return (
    <ScreenContainer variant="espresso" paddingHorizontal={0}>
      <View style={{ paddingHorizontal: spacing['5'] }}>
        <TopBar title="Wishlist" showBack />
      </View>

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={['posts', 'products']} />

      {activeTab === 'products' ? (
        emptyProducts ? (
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={40} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyTitle}>No saved products</Text>
            <Text style={styles.emptyText}>Products you heart from the backend catalog will appear here.</Text>
            <PrimaryButton label="Browse shop" onPress={() => router.replace('/(home-feed)/(tabs)/shop' as never)} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.grid}>
              {items.map((p, idx) => (
                <Card
                  key={p.id ? `wishlist-item-${p.id}-${idx}` : `wishlist-item-${idx}`}
                  product={p}
                  onTap={() => router.push(`/product/${p.id}` as never)}
                  onRemove={() => remove(p.id)}
                  onAddCart={() => addCart({ id: p.id, name: p.name, price: p.price, image: p.image, vendor: p.vendor })}
                />
              ))}
            </View>
          </ScrollView>
        )
      ) : (
        emptyPosts ? (
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={40} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyTitle}>No saved posts</Text>
            <Text style={styles.emptyText}>Posts you bookmark from the home feed will appear here.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.postGrid}>
              {bookmarkedPosts.map((post, idx) => (
                <PostTile key={post.id ? `wishlist-post-${post.id}-${idx}` : `wishlist-post-${idx}`} post={post} />
              ))}
            </View>
          </ScrollView>
        )
      )}
    </ScreenContainer>
  );
}

function Card({
  product,
  onTap,
  onRemove,
  onAddCart,
}: {
  product: WishlistItem;
  onTap: () => void;
  onRemove?: () => void;
  onAddCart: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onTap} style={styles.imageWrap}>
        <Image source={product.image as any} style={styles.image} contentFit="cover" />
        {onRemove ? (
          <Pressable onPress={onRemove} hitSlop={6} style={styles.removeBtn}>
            <Ionicons name="heart" size={16} color="#FF3B47" />
          </Pressable>
        ) : null}
      </Pressable>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.vendor} numberOfLines={1}>{product.vendor}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>₦{product.price.toLocaleString()}</Text>
        <Pressable onPress={onAddCart} hitSlop={6} style={styles.cartBtn}>
          <Ionicons name="bag-add-outline" size={16} color={palette.ink.onLightStrong} />
        </Pressable>
      </View>
    </View>
  );
}

function PostTile({ post }: { post: Post }) {
  const imageUrl = post.imageUrls?.[0];

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}` as never)}
      style={styles.postTile}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.postImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.postImage} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} locations={[0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.tileBadge}>
        <Ionicons name="repeat" size={14} color="#fff" />
      </View>
      <View style={styles.tileMeta}>
        <Text style={styles.tilePrice} numberOfLines={1}>@{post.author.handle}</Text>
      </View>
    </Pressable>
  );
}

import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 4) / 3;

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['4'],
    gap: spacing['3'],
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBtnActive: {
    backgroundColor: palette.brand.orange,
  },
  tabText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  scroll: { paddingBottom: 40 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['5'],
  },
  emptyTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  intro: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkSoft,
    marginBottom: spacing['3'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 2,
  },
  postTile: {
    width: TILE_SIZE,
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  postImage: { width: '100%', height: '100%' },
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
  tilePrice: { fontFamily: typography.bodyEmphasis.fontFamily, color: '#fff', fontSize: 13 },
  card: {
    width: '48%',
    gap: 4,
  },
  imageWrap: { position: 'relative' },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#121833',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  vendor: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.brand.orange,
  },
  cartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
