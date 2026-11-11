import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from '@/components/kit/Chip';
import { PriceTag } from '@/components/kit/Fields';
import { PressableScale } from '@/components/ui/PressableScale';
import type { RankedProduct } from '@/src/api/types';
import { glass } from '@/src/theme/plasma';
import { continuous, corner, type, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

export type ProductCardProps = {
  product: RankedProduct;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Product-first grid card enclosed in a frosted glass frame with a hairline rim.
 */
export function ProductCard({ product, onPress, style }: ProductCardProps) {
  const ui = useUi();
  const g = ui.isDark ? glass.dark : glass.light;
  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatKobo(product.price)}`}
      onPress={onPress}
      haptic="light"
      scaleTo={0.97}
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
      <View style={[styles.image, { backgroundColor: ui.cardRaised, borderColor: ui.separator }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        ) : null}
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(5, 7, 15, 0.55)']}
          style={StyleSheet.absoluteFill}
        />
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
        <Text style={[type.subhead, styles.title, { color: ui.label }]} numberOfLines={2}>
          {product.title}
        </Text>
        <PriceTag value={formatKobo(product.price)} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: corner.lg,
    padding: 8,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: corner.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
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
  meta: { gap: 4, paddingHorizontal: 4, paddingBottom: 4 },
  title: { fontFamily: 'Inter_500Medium', letterSpacing: -0.2 },
});
