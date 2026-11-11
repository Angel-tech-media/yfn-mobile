import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RepostSheet } from '@/components/ui/RepostSheet';
import { useProduct } from '@/src/api/products/hooks';
import { useMyReposts } from '@/src/api/reposts/hooks';
import { useToast } from '@/src/hooks/use-toast';
import { vibeHaptics } from '@/src/lib/haptics';
import { useCart, useCartCount } from '@/src/store/cart';
import { useIsWishlisted, useWishlist } from '@/src/store/wishlist';
import { continuous, layout, useUi } from '@/src/theme/ui';
import { formatKobo, koboToNaira } from '@/src/utils/money';

const HERO = require('@/assets/figma/product-sample.png');

interface ColorVariant {
  key: string;
  name: string;
  hex: string;
}

const COLOR_MAP: Record<string, string> = {
  black: '#162821',
  ink: '#162821',
  white: '#FDFCF8',
  silver: '#C0C0C0',
  gold: '#D4AF37',
  lime: '#C8FF3B',
  coral: '#F06543',
  navy: '#1E293B',
  crimson: '#DC143C',
  red: '#DC143C',
  blue: '#2B9FD9',
  sky: '#2B9FD9',
  green: '#1D4A38',
  tan: '#D2B48C',
  brown: '#8D6E63',
  orange: '#F06543',
  purple: '#8E24AA',
  yellow: '#F5B82E',
  sun: '#F5B82E',
  grey: '#757575',
  gray: '#757575',
};

function resolveColor(c: any, index: number): ColorVariant {
  if (typeof c === 'string') {
    const lower = c.toLowerCase();
    let foundHex = '#1D4A38';
    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      if (lower.includes(name)) {
        foundHex = hex;
        break;
      }
    }
    return {
      key: `color-${c}-${index}`,
      name: c,
      hex: foundHex,
    };
  }
  return {
    key: String(c?.key ?? c?.name ?? `color-${index}`),
    name: String(c?.name ?? c?.key ?? `Color ${index + 1}`),
    hex: String(c?.hex ?? '#1D4A38'),
  };
}

export default function ProductDetailScreen() {
  const ui = useUi();
  const toast = useToast();
  const { id, via } = useLocalSearchParams<{ id: string; via?: string }>();
  const productId = String(id ?? '');
  const { data: product, isLoading, isError, refetch, isFetching } = useProduct(productId);
  const { data: reposts = [] } = useMyReposts();

  const [activeColor, setActiveColor] = useState('');
  const [activeSize, setActiveSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [repostOpen, setRepostOpen] = useState(false);

  const liked = useIsWishlisted(String(id));
  const toggleWishlist = useWishlist((s) => s.toggle);
  const addToCart = useCart((s) => s.add);
  const cartCount = useCartCount();

  const reposted = reposts.some((repost) => repost.productId === productId);
  const colors: ColorVariant[] = (product?.variants?.colors ?? []).map(resolveColor);
  const sizes: string[] = (product?.variants?.sizes ?? []).map((s: any, idx: number) =>
    typeof s === 'string' ? s : String(s?.name ?? s?.label ?? s?.size ?? `Size ${idx + 1}`),
  );
  const priceNaira = koboToNaira(product?.price ?? 0);
  const imageSource = productImageSource(product);

  useEffect(() => {
    if (!activeColor && colors[0]) setActiveColor(colors[0].name);
    if (!activeSize && sizes[0]) setActiveSize(sizes[0]);
  }, [activeColor, activeSize, colors, sizes]);

  const handleAdd = () => {
    if (!product) return false;
    if (sizes.length > 0 && !activeSize) {
      toast.show({ variant: 'error', title: 'Pick a size first' });
      return false;
    }
    vibeHaptics.medium();
    addToCart(
      {
        id: product.id,
        name: product.title,
        price: priceNaira,
        priceKobo: product.price,
        image: imageSource,
        vendor: product.vendor.storeName,
        vendorId: product.vendorId,
        color: activeColor || undefined,
      },
      quantity,
    );
    return true;
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={ui.accent} />
            <Text style={[styles.centerText, { color: ui.secondaryLabel }]}>Loading product…</Text>
          </View>
        ) : isError || !product ? (
          <View style={styles.center}>
            <Text style={[styles.centerText, { color: ui.label }]}>
              Couldn&apos;t load this product.
            </Text>
            <Pressable onPress={() => refetch()} disabled={isFetching}>
              <Text style={[styles.retryText, { color: ui.coral }]}>
                {isFetching ? 'Retrying…' : 'Try again'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              {/* Lovable Square Hero Image with Floating TopBar & HeartToggle */}
              <View style={styles.heroContainer}>
                <Image source={imageSource} style={styles.heroImage} contentFit="cover" />

                <View style={styles.floatingTopBar}>
                  <PressableScale
                    haptic="light"
                    onPress={() => router.back()}
                    style={[styles.circleBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                    <Ionicons name="chevron-back" size={20} color={ui.label} />
                  </PressableScale>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <PressableScale
                      haptic="light"
                      onPress={() => setRepostOpen(true)}
                      style={[styles.circleBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                      <Ionicons
                        name="repeat"
                        size={18}
                        color={reposted ? ui.accent : ui.label}
                      />
                    </PressableScale>
                    <PressableScale
                      haptic="light"
                      onPress={() => router.push('/cart' as never)}
                      style={[styles.circleBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                      <Ionicons name="bag-handle-outline" size={18} color={ui.label} />
                      {cartCount > 0 ? (
                        <View style={[styles.cartBadge, { backgroundColor: ui.coral }]}>
                          <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                      ) : null}
                    </PressableScale>
                  </View>
                </View>

                <PressableScale
                  haptic="selection"
                  onPress={() =>
                    toggleWishlist({
                      id: product.id,
                      name: product.title,
                      price: priceNaira,
                      image: imageSource,
                      vendor: product.vendor.storeName,
                    })
                  }
                  style={[styles.floatingHeart, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={liked ? ui.coral : ui.label}
                  />
                </PressableScale>
              </View>

              {/* Lovable Rounded-3XL Sheet Body */}
              <View style={[styles.sheetBody, { backgroundColor: ui.background }]}>
                {via ? (
                  <Pressable
                    onPress={() => router.push(`/u/${via}` as never)}
                    style={[styles.viaBanner, { backgroundColor: ui.secondary }]}>
                    <Ionicons name="repeat" size={14} color={ui.accent} />
                    <Text style={[styles.viaText, { color: ui.secondaryLabel }]}>
                      Discovered via <Text style={{ color: ui.label, fontWeight: '700' }}>@{via}</Text>
                    </Text>
                  </Pressable>
                ) : null}

                {/* Vendor Link */}
                <Pressable onPress={() => router.push(`/u/${product.vendor.handle}` as never)}>
                  <Text style={[styles.vendorKicker, { color: ui.accent }]}>
                    {product.vendor.storeName.toUpperCase()} · LAGOS
                  </Text>
                </Pressable>

                {/* Product Name */}
                <Text style={[styles.title, { color: ui.label }]}>{product.title}</Text>

                {/* Rating & Stock Row */}
                <View style={styles.metaRow}>
                  <View style={styles.starInline}>
                    <Ionicons name="star" size={14} color="#F5B82E" />
                    <Text style={[styles.ratingBold, { color: ui.label }]}>
                      {(product.rating ?? product.vendor.rating ?? 4.9).toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[styles.reviewsMuted, { color: ui.secondaryLabel }]}>
                    {product.ratingCount ?? product.vendor.ratingCount ?? 18} reviews
                  </Text>
                  {product.stock !== undefined && product.stock <= 5 ? (
                    <View style={styles.lowStockPill}>
                      <Text style={[styles.lowStockText, { color: ui.coral }]}>
                        Only {product.stock} left
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Price */}
                <Text style={[styles.price, { color: ui.label }]}>
                  {formatKobo(product.price)}
                </Text>

                {/* Colour Swatches */}
                {colors.length > 0 ? (
                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionTitle, { color: ui.label }]}>
                      Colour: <Text style={{ color: ui.secondaryLabel }}>{activeColor}</Text>
                    </Text>
                    <View style={styles.swatchRow}>
                      {colors.map((c) => {
                        const selected = activeColor === c.name;
                        return (
                          <Pressable
                            key={c.key}
                            onPress={() => {
                              vibeHaptics.selection();
                              setActiveColor(c.name);
                            }}
                            style={[
                              styles.swatchOuter,
                              {
                                borderColor: selected ? ui.accent : ui.separator,
                                borderWidth: selected ? 2 : 1,
                              },
                            ]}>
                            <View style={[styles.swatchInner, { backgroundColor: c.hex }]} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {/* Size Selector */}
                {sizes.length > 0 ? (
                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionTitle, { color: ui.label }]}>Size</Text>
                    <View style={styles.sizeRow}>
                      {sizes.map((s) => {
                        const selected = activeSize === s;
                        return (
                          <Pressable
                            key={s}
                            onPress={() => {
                              vibeHaptics.selection();
                              setActiveSize(s);
                            }}
                            style={[
                              styles.sizePill,
                              {
                                backgroundColor: selected ? ui.accent : ui.card,
                                borderColor: selected ? ui.accent : ui.separator,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.sizeText,
                                { color: selected ? ui.onAccent : ui.label },
                              ]}>
                              {s}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {/* Quantity Stepper */}
                <View style={styles.qtyRow}>
                  <Text style={[styles.sectionTitle, { color: ui.label }]}>Quantity</Text>
                  <View style={[styles.qtyCapsule, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                    <Pressable
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={[styles.qtyCircle, { backgroundColor: ui.secondary }]}>
                      <Ionicons name="remove" size={16} color={ui.label} />
                    </Pressable>
                    <Text style={[styles.qtyNumber, { color: ui.label }]}>{quantity}</Text>
                    <Pressable
                      onPress={() => setQuantity((q) => q + 1)}
                      style={[styles.qtyCircle, { backgroundColor: ui.secondary }]}>
                      <Ionicons name="add" size={16} color={ui.label} />
                    </Pressable>
                  </View>
                </View>

                {/* Description */}
                {product.description ? (
                  <Text style={[styles.description, { color: ui.secondaryLabel }]}>
                    {product.description}
                  </Text>
                ) : null}

                {/* Lovable 2-Column Trust & Delivery Grid */}
                <View style={styles.trustGrid}>
                  <View style={[styles.trustBox, { backgroundColor: ui.secondary }]}>
                    <Ionicons name="car-outline" size={18} color={ui.accent} />
                    <Text style={[styles.trustText, { color: ui.label }]}>
                      {(product.distanceKm ?? 3.2).toFixed(1)} km away · free pickup or rider delivery
                    </Text>
                  </View>
                  <View style={[styles.trustBox, { backgroundColor: ui.secondary }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={ui.accent} />
                    <Text style={[styles.trustText, { color: ui.label }]}>
                      Paid safely in escrow. Money back if it never arrives
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Lovable Sticky Bottom Bar: Add to Cart + Buy Now */}
            <View
              style={[
                styles.bottomBar,
                {
                  backgroundColor: ui.card,
                  borderTopColor: ui.separator,
                },
              ]}>
              <PrimaryButton
                label="Add to cart"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => {
                  if (handleAdd()) {
                    toast.show({ variant: 'success', title: 'Added to cart' });
                  }
                }}
              />
              <PrimaryButton
                label="Buy now"
                style={{ flex: 1 }}
                onPress={() => {
                  if (handleAdd()) {
                    router.push('/checkout' as never);
                  }
                }}
              />
            </View>
          </>
        )}
      </SafeAreaView>

      {product ? (
        <RepostSheet
          visible={repostOpen}
          onClose={() => setRepostOpen(false)}
          product={{
            id: product.id,
            name: product.title,
            price: formatKobo(product.price),
            vendor: product.vendor.storeName,
            vendorId: product.vendorId,
          }}
        />
      ) : null}
    </EspressoBackground>
  );
}

function productImageSource(
  product:
    | {
        images?: string[];
        media?: { url: string; type: 'image' | 'video' }[];
      }
    | null
    | undefined,
) {
  const url =
    product?.images?.[0] ?? product?.media?.find((asset) => asset.type === 'image')?.url;
  return url ? { uri: url } : HERO;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 110 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  centerText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 14,
  },
  retryText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 14,
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingTopBar: {
    position: 'absolute',
    top: 12,
    left: layout.gutter,
    right: layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 28,
    right: layout.gutter,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheetBody: {
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    gap: 10,
  },
  viaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  viaText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  vendorKicker: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingBold: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 13,
  },
  reviewsMuted: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
  },
  lowStockPill: {
    backgroundColor: 'rgba(240, 101, 67, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  lowStockText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
  },
  price: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 30,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  sectionBlock: {
    marginTop: 10,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swatchOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchInner: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizePill: {
    minWidth: 48,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  qtyCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  qtyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumber: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
    minWidth: 26,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  trustGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  trustBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    gap: 6,
    ...continuous,
  },
  trustText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: layout.gutter,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
