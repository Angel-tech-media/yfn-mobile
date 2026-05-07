import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useCart } from '@/src/store/cart';
import { useWishlist } from '@/src/store/wishlist';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

const SEED = [
  { id: 'w1', name: 'Ankara high shoulder fitted gown', price: 24990, image: PRODUCT_IMAGE, vendor: "Sarah's Boutique" },
  { id: 'w2', name: 'Birkin handbag deluxe edition', price: 149000, image: PRODUCT_IMAGE, vendor: 'Janet Ogborini' },
  { id: 'w3', name: 'Leopard heeled sandals', price: 38500, image: PRODUCT_IMAGE, vendor: "Sarah's Boutique" },
];

export default function WishlistScreen() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const addCart = useCart((s) => s.add);

  const display = items.length ? items : SEED;
  const empty = items.length === 0;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Wishlist" showBack />

      {empty ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.intro}>Suggested for you</Text>
          <View style={styles.grid}>
            {display.map((p) => (
              <Card
                key={p.id}
                product={p}
                onTap={() => router.push(`/product/${p.id}` as never)}
                onRemove={undefined}
                onAddCart={() => addCart({ id: p.id, name: p.name, price: p.price, image: p.image, vendor: p.vendor })}
              />
            ))}
          </View>
        </ScrollView>
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
  product: typeof SEED[number];
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
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
