import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useCart } from '@/src/store/cart';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const PRICE = 24990;

const COLORS = [
  { key: 'cream', hex: '#E8DDC8' },
  { key: 'navy', hex: '#1A2C44' },
  { key: 'forest', hex: '#284E3A' },
  { key: 'orange', hex: '#FD8616' },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeColor, setActiveColor] = useState('cream');
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const addToCart = useCart((s) => s.add);

  const buyNow = () => {
    addToCart(
      {
        id: String(id),
        name: 'Ankara high shoulder fitted gown',
        price: PRICE,
        image: PRODUCT_IMAGE,
        vendor: "Sarah's Boutique",
        color: activeColor,
      },
      quantity
    );
    router.push('/checkout');
  };

  const onAdd = () => {
    addToCart(
      {
        id: String(id),
        name: 'Ankara high shoulder fitted gown',
        price: PRICE,
        image: PRODUCT_IMAGE,
        vendor: "Sarah's Boutique",
        color: activeColor,
      },
      quantity
    );
    router.push('/cart');
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Pressable onPress={() => setLiked((l) => !l)} hitSlop={8} style={styles.iconBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#FF3B47' : palette.ink.onDarkStrong}
            />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Image
            source={require('@/assets/figma/product-sample.png')}
            style={styles.heroImage}
            contentFit="cover"
          />

          <View style={styles.info}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>Aaa</Text>
              <View style={styles.divider} />
              <View style={styles.starRow}>
                <Ionicons name="star" size={14} color={palette.brand.amber} />
                <Text style={styles.rating}>4.8</Text>
                <Text style={styles.reviews}>(64 Reviews)</Text>
              </View>
            </View>

            <Text style={styles.title}>Ankara high shoulder fitted gown</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₦24,990</Text>
              <Text style={styles.oldPrice}>₦26,250</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-5%</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setActiveColor(c.key)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c.hex },
                    activeColor === c.key && styles.swatchActive,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qtyBtn}>
                <Ionicons name="remove" size={16} color={palette.ink.onDarkStrong} />
              </Pressable>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.qtyBtn}>
                <Ionicons name="add" size={16} color={palette.ink.onDarkStrong} />
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>
              A statement Ankara gown with a high-shoulder silhouette and a fitted waist.
              Tailored from premium African wax fabric. Limited run from vendor #{String(id).slice(-3)}.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={({ pressed }) => [styles.cartBtn, pressed && { opacity: 0.85 }]} onPress={onAdd}>
            <Text style={styles.cartLabel}>Add to cart</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]} onPress={buyNow}>
            <Text style={styles.buyLabel}>₦{(PRICE * quantity).toLocaleString()}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['2'],
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  scroll: {
    paddingBottom: 120,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 0.95,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  info: {
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['4'],
    gap: spacing['3'],
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  brand: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  divider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.20)' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  reviews: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: palette.ink.onDarkStrong,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing['2'] },
  price: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: palette.ink.onDarkStrong,
  },
  oldPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(76,175,80,0.16)',
  },
  discountText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#1F8E26',
  },
  sectionLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
    marginTop: spacing['2'],
  },
  colorRow: { flexDirection: 'row', gap: spacing['2'] },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: palette.brand.orange,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  qtyValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
    minWidth: 24,
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
  },
  cartBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  cartLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  buyBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg.surface,
  },
  buyLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: palette.ink.onLightStrong,
  },
});
