import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { Badge } from '@/components/kit/Chip';
import { PriceTag } from '@/components/kit/Fields';
import { PressableScale } from '@/components/ui/PressableScale';
import type { RankedProduct } from '@/src/api/types';
import { continuous, corner, type, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

export type ProductCardProps = {
  product: RankedProduct;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Product-first grid card: the photo is the hero, then title, then price.
 * No fabricated ratings; only real data (verified, distance) is shown.
 */
export function ProductCard({ product, onPress, style }: ProductCardProps) {
  const ui = useUi();
  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatKobo(product.price)}`}
      onPress={onPress}
      haptic="light"
      scaleTo={0.97}
      style={[styles.card, style]}>
      <View style={[styles.image, { backgroundColor: ui.card }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        ) : null}
        {product.isYfnVerified || product.distanceKm !== undefined ? (
          <View style={styles.overlay}>
            {product.isYfnVerified ? <Badge tone="overlay" icon="checkmark-circle" label="Verified" /> : null}
            {product.distanceKm !== undefined ? (
              <Badge tone="overlay" icon="location" label={`${product.distanceKm.toFixed(1)} km`} />
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text style={[type.subhead, { color: ui.label }]} numberOfLines={2}>
          {product.title}
        </Text>
        <PriceTag value={formatKobo(product.price)} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: corner.lg,
    overflow: 'hidden',
    ...continuous,
  },
  overlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  meta: { gap: 4, paddingHorizontal: 2 },
});
