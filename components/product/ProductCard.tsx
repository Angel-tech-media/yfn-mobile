import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
import {
  actions,
  formatNaira,
  getVendor,
  useApp,
  type Product,
} from '@/src/data/lovable-data';
import { useToast } from '@/src/hooks/use-toast';
import { continuous, useUi } from '@/src/theme/ui';

export type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ProductCard({ product, onPress, style }: ProductCardProps) {
  const ui = useUi();
  const toast = useToast();

  const saved = useApp((s) => s.wishlist.includes(product.id));
  const vendor = getVendor(product.vendorId);
  const off = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${product.id}` as never);
    }
  };

  const handleToggleWishlist = () => {
    actions.toggleWishlist(product.id);
    toast.show({
      variant: 'success',
      title: saved ? 'Removed from wishlist' : 'Saved to wishlist',
    });
  };

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatNaira(product.price)}`}
      onPress={handlePress}
      haptic="light"
      scaleTo={0.975}
      style={[styles.container, style]}>
      {/* 4:5 Rounded Image Frame */}
      <View style={[styles.imageContainer, { backgroundColor: ui.cardRaised, borderColor: ui.separator }]}>
        <Image
          source={product.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />

        {/* Top-left Discount or Tag Badge */}
        {off > 0 ? (
          <View style={[styles.badgePill, { backgroundColor: ui.coral }]}>
            <Text style={[styles.badgeText, { color: ui.coralForeground }]}>−{off}%</Text>
          </View>
        ) : product.tag ? (
          <View style={[styles.badgePill, { backgroundColor: ui.card, borderColor: ui.separator, borderWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.badgeText, { color: ui.label }]}>{product.tag}</Text>
          </View>
        ) : null}

        {/* Top-right Heart Button */}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          haptic="medium"
          scaleTo={0.88}
          hitSlop={8}
          onPress={handleToggleWishlist}
          style={[styles.heartBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={16}
            color={saved ? ui.coral : ui.label}
          />
        </PressableScale>

        {/* Bottom Scarcity Pill */}
        {product.stock <= 5 ? (
          <View style={[styles.scarcityPill, { backgroundColor: ui.ink }]}>
            <Text style={[styles.scarcityText, { color: ui.inkForeground }]}>
              Only {product.stock} left
            </Text>
          </View>
        ) : null}
      </View>

      {/* Meta */}
      <View style={styles.meta}>
        <Text style={[styles.vendorName, { color: ui.secondaryLabel }]} numberOfLines={1}>
          {vendor?.name?.toUpperCase() || 'AKTIVE VENDOR'}
        </Text>
        <Text style={[styles.title, { color: ui.label }]} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <View style={styles.priceLeft}>
            <Text style={[styles.priceText, { color: ui.label }]}>
              {formatNaira(product.price)}
            </Text>
            {product.oldPrice ? (
              <Text style={[styles.oldPriceText, { color: ui.secondaryLabel }]}>
                {formatNaira(product.oldPrice)}
              </Text>
            ) : null}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F5B82E" />
            <Text style={[styles.ratingText, { color: ui.label }]}>
              {product.rating}
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  scarcityPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  scarcityText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 10,
  },
  meta: {
    paddingTop: 10,
    paddingHorizontal: 2,
    gap: 2,
  },
  vendorName: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
  },
  oldPriceText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
});
