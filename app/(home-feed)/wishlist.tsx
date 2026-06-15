import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useCart } from '@/src/store/cart';
import { useWishlist, type WishlistItem } from '@/src/store/wishlist';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function WishlistScreen() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const addCart = useCart((s) => s.add);

  const empty = items.length === 0;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Wishlist" showBack />

      {empty ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={40} color={palette.ink.onDarkMuted} />
          <Text style={styles.emptyTitle}>No saved products</Text>
          <Text style={styles.emptyText}>Products you heart from the backend catalog will appear here.</Text>
          <PrimaryButton label="Browse shop" onPress={() => router.replace('/(tabs)/shop' as never)} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {items.map((p) => (
              <Card
                key={p.id}
                product={p}
                onTap={() => router.push(`/product/${p.id}` as never)}
                onRemove={() => remove(p.id)}
                onAddCart={() => addCart({ id: p.id, name: p.name, price: p.price, image: p.image, vendor: p.vendor })}
              />
            ))}
          </View>
        </ScrollView>
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
        <Image source={product.image} style={styles.image} contentFit="cover" />
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

const styles = StyleSheet.create({
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
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
