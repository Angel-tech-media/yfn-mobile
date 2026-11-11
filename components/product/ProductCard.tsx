import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { PressableScale } from '@/components/ui/PressableScale';
import type { RankedProduct } from '@/src/api/types';
import { useToast } from '@/src/hooks/use-toast';
import { useIsWishlisted, useWishlist } from '@/src/store/wishlist';
import { glass } from '@/src/theme/plasma';
import { continuous, corner, type, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

export type ProductCardProps = {
  product: RankedProduct;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Editorial Apple-grade social commerce product card inspired by Lovable ("Lagos Paper"):
 * - 4:5 aspect ratio photography frame with smooth squircle corners.
 * - Floating top-left scarcity badge ("Only 3 left" / "Verified") & top-right wishlist heart.
 * - Restrained typography: uppercase category tracking, clean title, and 24k Champagne Gold pricing.
 */
export function ProductCard({ product, onPress, style }: ProductCardProps) {
  const ui = useUi();
  const toast = useToast();
  const g = ui.isDark ? glass.dark : glass.light;
  const isWishlisted = useIsWishlisted(product.id);
  const toggleWishlist = useWishlist((s) => s.toggle);

  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.title,
      price: product.price,
      image: imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png'),
      vendor: product.category || 'Aktive Vendor',
    });
    toast.show({
      variant: 'success',
      title: isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist',
    });
  };

  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatKobo(product.price)}`}
      onPress={onPress}
      haptic="light"
      scaleTo={0.975}
      style={[
        styles.card,
        {
          backgroundColor: ui.card,
          borderColor: ui.separator,
        },
        style,
      ]}>
      {/* Specular glass highlight sheen */}
      <LinearGradient
        pointerEvents="none"
        colors={g.sheen}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Image container */}
      <View style={[styles.imageContainer, { backgroundColor: ui.cardRaised, borderColor: ui.separator }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
            <Ionicons name="bag-handle-outline" size={28} color={ui.tertiaryLabel} />
          </View>
        )}

        {/* Ambient bottom shadow gradient on image */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0.02)', 'rgba(5, 7, 15, 0.45)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Floating Top Badges */}
        <View style={styles.topBadges}>
          {product.isYfnVerified ? (
            <View style={[styles.pillBadge, { backgroundColor: 'rgba(18, 24, 21, 0.78)', borderColor: 'rgba(200, 255, 59, 0.35)' }]}>
              <Ionicons name="checkmark-circle" size={11} color={ui.lime} />
              <Text style={[styles.pillText, { color: ui.lime }]}>Verified</Text>
            </View>
          ) : isLowStock ? (
            <View style={[styles.pillBadge, { backgroundColor: 'rgba(22, 22, 27, 0.82)', borderColor: 'rgba(240, 101, 67, 0.35)' }]}>
              <View style={[styles.dot, { backgroundColor: ui.coral }]} />
              <Text style={[styles.pillText, { color: ui.coral }]}>Only {product.stock} left</Text>
            </View>
          ) : product.category ? (
            <View style={[styles.pillBadge, { backgroundColor: 'rgba(22, 22, 27, 0.70)', borderColor: ui.separator }]}>
              <Text style={[styles.pillText, { color: ui.secondaryLabel }]}>{product.category}</Text>
            </View>
          ) : null}

          {/* Wishlist Heart Button */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            haptic="medium"
            scaleTo={0.88}
            hitSlop={8}
            onPress={handleToggleWishlist}
            style={[styles.heartBtn, { backgroundColor: 'rgba(18, 22, 27, 0.68)', borderColor: ui.separator }]}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={15}
              color={isWishlisted ? ui.coral : '#FAFAFA'}
            />
          </PressableScale>
        </View>

        {/* Floating Bottom Left: Distance if present */}
        {product.distanceKm !== undefined ? (
          <View style={styles.bottomBadge}>
            <View style={[styles.pillBadge, { backgroundColor: 'rgba(10, 14, 20, 0.75)', borderColor: ui.separator }]}>
              <Ionicons name="location-outline" size={11} color={ui.secondaryLabel} />
              <Text style={[styles.pillText, { color: ui.secondaryLabel }]}>
                {product.distanceKm.toFixed(1)} km
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Metadata */}
      <View style={styles.meta}>
        <Text style={[type.caption2, styles.categoryLabel, { color: ui.secondaryLabel }]} numberOfLines={1}>
          {product.category?.toUpperCase() || 'MARKET'}
        </Text>
        <Text style={[type.subhead, styles.title, { color: ui.label }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: ui.gold }]}>
            {formatKobo(product.price)}
          </Text>
          {product.stock !== undefined && product.stock > 5 ? (
            <Text style={[type.caption2, { color: ui.secondaryLabel }]}>In stock</Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: corner.lg,
    padding: 7,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: corner.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadges: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: -0.1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  heartBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  meta: {
    gap: 3,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  categoryLabel: {
    letterSpacing: 0.6,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    opacity: 0.75,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
    fontSize: 14,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceText: {
    fontFamily: 'InterTight_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
});
