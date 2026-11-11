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

        {/* Top Badges */}
        <View style={styles.topBadges}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {product.isYfnVerified ? (
              <View style={[styles.pillBadge, { backgroundColor: ui.ink, borderColor: 'rgba(200, 255, 59, 0.35)' }]}>
                <Ionicons name="checkmark-circle" size={11} color={ui.lime} />
                <Text style={[styles.pillText, { color: ui.lime }]}>Verified</Text>
              </View>
            ) : product.category ? (
              <View style={[styles.pillBadge, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                <Text style={[styles.pillText, { color: ui.label }]}>{product.category}</Text>
              </View>
            ) : null}
          </View>

          {/* Wishlist Heart Button */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            haptic="medium"
            scaleTo={0.88}
            hitSlop={8}
            onPress={handleToggleWishlist}
            style={[styles.heartBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={15}
              color={isWishlisted ? ui.coral : ui.label}
            />
          </PressableScale>
        </View>

        {/* Bottom Scarcity / Distance Pill */}
        {isLowStock ? (
          <View style={styles.bottomBadge}>
            <View style={[styles.pillBadge, { backgroundColor: ui.ink, borderColor: 'transparent' }]}>
              <View style={[styles.dot, { backgroundColor: ui.coral }]} />
              <Text style={[styles.pillText, { color: ui.inkForeground }]}>Only {product.stock} left</Text>
            </View>
          </View>
        ) : product.distanceKm !== undefined ? (
          <View style={styles.bottomBadge}>
            <View style={[styles.pillBadge, { backgroundColor: ui.ink, borderColor: 'transparent' }]}>
              <Ionicons name="location-outline" size={11} color={ui.inkForeground} />
              <Text style={[styles.pillText, { color: ui.inkForeground }]}>
                {product.distanceKm.toFixed(1)} km
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Metadata */}
      <View style={styles.meta}>
        <Text style={[type.caption2, styles.categoryLabel, { color: ui.secondaryLabel }]} numberOfLines={1}>
          {product.category?.toUpperCase() || 'AKTIVE MARKET'}
        </Text>
        <Text style={[type.subhead, styles.title, { color: ui.label }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { color: ui.gold }]}>
            {formatKobo(product.price)}
          </Text>
          <View style={styles.starRow}>
            <Ionicons name="star" size={11} color={ui.coral} />
            <Text style={[styles.ratingText, { color: ui.label }]}>4.9</Text>
          </View>
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
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 10,
    letterSpacing: -0.1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  heartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    letterSpacing: 0.8,
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 10,
  },
  title: {
    fontFamily: 'InstrumentSans_600SemiBold',
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
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
  },
});
