import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProfileTabs, type TabKey } from '@/components/ui/ProfileTabs';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useMyBookmarkedPosts } from '@/src/api/feed/hooks';
import type { Post } from '@/src/api/types';
import { useCart } from '@/src/store/cart';
import { useWishlist, type WishlistItem } from '@/src/store/wishlist';
import { continuous, layout, useUi } from '@/src/theme/ui';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 4) / 3;

export default function WishlistScreen() {
  const ui = useUi();
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
      <View style={{ paddingHorizontal: layout.gutter }}>
        <TopBar
          title="Wishlist"
          subtitle={items.length ? `${items.length} saved` : undefined}
          showBack
        />
      </View>

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={['products', 'posts']} />

      {activeTab === 'products' ? (
        emptyProducts ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIconBox, { backgroundColor: ui.secondary }]}>
              <Ionicons name="heart-outline" size={34} color={ui.coral} />
            </View>
            <Text style={[styles.emptyTitle, { color: ui.label }]}>Nothing saved yet</Text>
            <Text style={[styles.emptyText, { color: ui.secondaryLabel }]}>
              Tap the heart on any product to keep it here for later.
            </Text>
            <View style={{ width: '100%', marginTop: 12 }}>
              <PrimaryButton
                label="Browse the market"
                onPress={() => router.replace('/(home-feed)/(tabs)/market' as never)}
              />
            </View>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.grid}>
              {items.map((p, idx) => (
                <WishlistProductCard
                  key={p.id ? `wishlist-item-${p.id}-${idx}` : `wishlist-item-${idx}`}
                  product={p}
                  onTap={() => router.push(`/product/${p.id}` as never)}
                  onRemove={() => remove(p.id)}
                  onAddCart={() =>
                    addCart({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      image: p.image,
                      vendor: p.vendor,
                    })
                  }
                />
              ))}
            </View>
          </ScrollView>
        )
      ) : emptyPosts ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconBox, { backgroundColor: ui.secondary }]}>
            <Ionicons name="bookmark-outline" size={34} color={ui.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: ui.label }]}>No saved posts</Text>
          <Text style={[styles.emptyText, { color: ui.secondaryLabel }]}>
            Posts you bookmark from the home feed will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.postGrid}>
            {bookmarkedPosts.map((post, idx) => (
              <PostTile
                key={post.id ? `wishlist-post-${post.id}-${idx}` : `wishlist-post-${idx}`}
                post={post}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function WishlistProductCard({
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
  const ui = useUi();
  return (
    <View style={[styles.card, { backgroundColor: ui.card, borderColor: ui.separator }]}>
      <Pressable onPress={onTap} style={styles.imageWrap}>
        <Image source={product.image as any} style={styles.image} contentFit="cover" />
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            hitSlop={6}
            style={[styles.removeBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            <Ionicons name="heart" size={16} color={ui.coral} />
          </Pressable>
        ) : null}
      </Pressable>
      <View style={styles.cardBody}>
        <Text style={[styles.vendor, { color: ui.secondaryLabel }]} numberOfLines={1}>
          {product.vendor?.toUpperCase() || 'AKTIVE MARKET'}
        </Text>
        <Text style={[styles.name, { color: ui.label }]} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: ui.label }]}>
            ₦{product.price.toLocaleString('en-NG')}
          </Text>
          <Pressable
            onPress={onAddCart}
            hitSlop={6}
            style={[styles.cartBtn, { backgroundColor: ui.lime }]}>
            <Ionicons name="bag-add-outline" size={16} color={ui.limeForeground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PostTile({ post }: { post: Post }) {
  const ui = useUi();
  const imageUrl = post.imageUrls?.[0];

  return (
    <Pressable
      onPress={() => router.push(`/post/${post.id}` as never)}
      style={styles.postTile}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.postImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={ui.gradient} style={styles.postImage} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        locations={[0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tileMeta}>
        <Text style={styles.tileHandle} numberOfLines={1}>
          @{post.author.handle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 12, paddingBottom: 40 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...continuous,
  },
  emptyTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
  },
  card: {
    width: '48%',
    padding: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    ...continuous,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    paddingHorizontal: 4,
    paddingBottom: 4,
    gap: 3,
  },
  vendor: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.6,
  },
  name: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
  },
  cartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  postTile: {
    width: TILE_SIZE,
    aspectRatio: 1,
    overflow: 'hidden',
  },
  postImage: { width: '100%', height: '100%' },
  tileMeta: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  tileHandle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    color: '#FFFFFF',
    fontSize: 12,
  },
});
