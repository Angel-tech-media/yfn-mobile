import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { RepostSheet } from '@/components/ui/RepostSheet';
import {
  PLATFORM_FEE_LABEL,
  computePlatformFee,
} from '@/src/config/fees';
import { useAddresses } from '@/src/api/account/hooks';
import { useCreateOrder } from '@/src/api/orders/hooks';
import { useProduct } from '@/src/api/products/hooks';
import { useMyReposts } from '@/src/api/reposts/hooks';
import { usePayFromWallet, useTopUpWallet, useWallet } from '@/src/api/wallet/hooks';
import { useAuth } from '@/src/store/auth';
import { useCart } from '@/src/store/cart';
import { useIsWishlisted, useWishlist } from '@/src/store/wishlist';
import { vibeHaptics } from '@/src/lib/haptics';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo, formatNaira, koboToNaira, nairaToKobo } from '@/src/utils/money';

const HERO = require('@/assets/figma/product-sample.png');

interface ColorVariant {
  key: string;
  name: string;
  hex: string;
}

const COLOR_MAP: Record<string, string> = {
  black: '#1A1A1A',
  white: '#F5F5F5',
  silver: '#C0C0C0',
  gold: '#D4AF37',
  navy: '#001F3F',
  crimson: '#DC143C',
  red: '#DC143C',
  blue: '#1E88E5',
  green: '#43A047',
  tan: '#D2B48C',
  brown: '#8D6E63',
  orange: '#FF8A00',
  purple: '#8E24AA',
  yellow: '#FBC02D',
  grey: '#757575',
  gray: '#757575',
};

function resolveColor(c: any, index: number): ColorVariant {
  if (typeof c === 'string') {
    const lower = c.toLowerCase();
    let foundHex = '#888888';
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
    hex: String(c?.hex ?? '#888888'),
  };
}

export default function ProductDetailScreen() {
  const { id, via } = useLocalSearchParams<{ id: string; via?: string }>();
  const productId = String(id ?? '');
  const { data: product, isLoading, isError, refetch, isFetching } = useProduct(productId);
  const { data: wallet } = useWallet();
  const { data: addresses = [] } = useAddresses();
  const { data: reposts = [] } = useMyReposts();
  const user = useAuth((s) => s.user);
  const createOrder = useCreateOrder();
  const payFromWallet = usePayFromWallet();
  const topUpWallet = useTopUpWallet();
  const [activeColor, setActiveColor] = useState('');
  const [activeSize, setActiveSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const liked = useIsWishlisted(String(id));
  const toggleWishlist = useWishlist((s) => s.toggle);
  const [repostOpen, setRepostOpen] = useState(false);
  const [payState, setPayState] = useState<'idle' | 'paid' | 'low' | 'address' | 'error'>('idle');
  const [payErrorMsg, setPayErrorMsg] = useState<string | null>(null);
  const reposted = reposts.some((repost) => repost.productId === productId);
  const addToCart = useCart((s) => s.add);
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const colors: ColorVariant[] = (product?.variants?.colors ?? []).map(resolveColor);
  const sizes: string[] = (product?.variants?.sizes ?? []).map((s: any, idx: number) =>
    typeof s === 'string' ? s : String(s?.name ?? s?.label ?? s?.size ?? `Size ${idx + 1}`)
  );
  const priceNaira = koboToNaira(product?.price ?? 0);
  const total = priceNaira * quantity;
  const platformFee = computePlatformFee(total);
  const grandTotal = total + platformFee;
  const imageSource = productImageSource(product);

  useEffect(() => {
    if (!activeColor && colors[0]) setActiveColor(colors[0].key);
    if (!activeSize && sizes[0]) setActiveSize(sizes[0]);
  }, [activeColor, activeSize, colors, sizes]);

  const handlePay = () => {
    if (!product) return;
    setPayErrorMsg(null);

    // If no default address saved, send to Checkout screen so user can enter address directly
    if (!defaultAddress) {
      addToCart(
        {
          id: product.id,
          name: product.title,
          price: priceNaira,
          priceKobo: product.price,
          image: imageSource,
          vendor: product.vendor.storeName,
          vendorId: product.vendorId,
          color: activeColor,
        },
        quantity,
      );
      router.push('/checkout');
      return;
    }

    createOrder.mutate(
      {
        vendorId: product.vendorId,
        items: [{ productId: product.id, qty: quantity, unit: product.price }],
        shipTo: {
          recipient: defaultAddress.recipient,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          phone: defaultAddress.phone,
        },
        referrerHandle: via,
      },
      {
        onSuccess: (order) => {
          payFromWallet.mutate(
            { amount: order.grandTotal, orderId: order.id, vendor: order.vendor },
            {
              onSuccess: () => {
                setPayState('paid');
                router.replace('/order-confirmed' as never);
              },
              onError: (err: any) => {
                const msg = err?.message || '';
                if (msg.includes('Insufficient') || msg.includes('balance')) {
                  setPayState('low');
                } else {
                  setPayErrorMsg(msg || 'Payment failed.');
                  setPayState('error');
                }
              },
            },
          );
        },
        onError: (err: any) => {
          const msg = err?.message || '';
          if (msg.includes('Insufficient') || msg.includes('balance')) {
            setPayState('low');
          } else {
            setPayErrorMsg(msg || 'Could not place order.');
            setPayState('error');
          }
        },
      },
    );
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onLightStrong} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
            <Pressable
              disabled={!product}
              onPress={() => setRepostOpen(true)}
              hitSlop={8}
              style={styles.iconBtn}>
              <Ionicons
                name="repeat"
                size={18}
                color={reposted ? palette.brand.orange : palette.ink.onLightStrong}
              />
            </Pressable>
            <Pressable
              disabled={!product}
              onPress={() => product &&
                toggleWishlist({
                  id: product.id,
                  name: product.title,
                  price: priceNaira,
                  image: imageSource,
                  vendor: product.vendor.storeName,
                })
              }
              hitSlop={8}
              style={styles.iconBtn}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? palette.status.danger : palette.ink.onLightStrong}
              />
            </Pressable>
          </View>
        </View>

        {via ? (
          <Pressable
            onPress={() => router.push(`/u/${via}` as never)}
            style={styles.viaBanner}>
            <Ionicons name="repeat" size={14} color={palette.brand.orange} />
            <Text style={styles.viaText}>
              You&apos;re here via <Text style={styles.viaHandle}>@{via}</Text>&apos;s repost.
            </Text>
            <Ionicons name="chevron-forward" size={14} color={palette.ink.onLightSubtle} />
          </Pressable>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={palette.brand.orange} />
              <Text style={styles.centerText}>Loading product…</Text>
            </View>
          ) : isError || !product ? (
            <View style={styles.center}>
              <Text style={styles.centerText}>Couldn&apos;t load this product.</Text>
              <Pressable onPress={() => refetch()} disabled={isFetching}>
                <Text style={styles.retryText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
              </Pressable>
            </View>
          ) : (
          <>
          <View style={styles.heroWrap}>
            <Image source={imageSource} style={styles.hero} contentFit="cover" />
          </View>

          <View style={styles.body}>
            {/* Vendor row + name + price */}
            <Pressable
              onPress={() => router.push(`/u/${product.vendor.handle}` as never)}
              style={styles.vendorRow}>
              <Image
                source={product.vendor.avatarUrl ? { uri: product.vendor.avatarUrl } : HERO}
                style={styles.vendorAvatar}
              />
              <View style={{ flex: 1 }}>
                <View style={styles.vendorNameRow}>
                  <Text style={styles.vendorName}>{product.vendor.storeName}</Text>
                  {product.vendor.isYfnVerified ? (
                    <View style={styles.kycBadge}>
                      <Ionicons name="shield-checkmark" size={10} color="#fff" />
                      <Text style={styles.kycText}>YFN</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={palette.brand.amber} />
                  <Text style={styles.ratingText}>
                    {(product.rating ?? product.vendor.rating).toFixed(1)}
                  </Text>
                  <Text style={styles.ratingMeta}>
                    ({product.ratingCount ?? product.vendor.ratingCount} reviews)
                    {typeof product.distanceKm === 'number' ? ` · ${product.distanceKm.toFixed(1)} km` : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.followBtn}>
                <Text style={styles.followText}>Follow</Text>
              </View>
            </Pressable>

            {/* Google Business Map & Proximity discovery */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/search',
                  params: { focus: 'map', q: product.title },
                } as never)
              }
              style={styles.findNearbyBtn}>
              <Ionicons name="map-outline" size={14} color={palette.brand.orange} />
              <Text style={styles.findNearbyText}>Find Nearby Vendors on Map</Text>
              <Ionicons name="chevron-forward" size={13} color={palette.ink.onDarkMuted} />
            </Pressable>

            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatKobo(product.price)}</Text>
            </View>

            {/* Description */}
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            {/* Colour */}
            {colors.length > 0 ? (
              <>
              <Text style={styles.sectionLabel}>Colour</Text>
              <View style={styles.swatchRow}>
              {colors.map((c, index) => {
                const on = activeColor === c.key;
                return (
                  <Pressable
                    key={c.key || `swatch-${index}`}
                    onPress={() => setActiveColor(c.key)}
                    style={[styles.swatchWrap, on && styles.swatchWrapOn]}>
                    <View style={[styles.swatch, { backgroundColor: c.hex }]} />
                  </Pressable>
                );
              })}
              </View>
              </>
            ) : null}

            {/* Size */}
            {sizes.length > 0 ? (
              <>
              <Text style={styles.sectionLabel}>Size</Text>
              <View style={styles.sizeRow}>
              {sizes.map((s, index) => {
                const on = activeSize === s;
                return (
                  <Pressable
                    key={`size-${s}-${index}`}
                    onPress={() => setActiveSize(s)}
                    style={[styles.size, on && styles.sizeOn]}>
                    <Text style={[styles.sizeLabel, on && styles.sizeLabelOn]}>{s}</Text>
                  </Pressable>
                );
              })}
              </View>
              </>
            ) : null}

            {/* Quantity */}
            <View style={styles.qtyRow}>
              <Text style={styles.sectionLabel}>Quantity</Text>
              <View style={styles.qtyStepper}>
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.qtyBtn}>
                  <Ionicons name="remove" size={16} color={palette.ink.onLightStrong} />
                </Pressable>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <Pressable
                  onPress={() => setQuantity((q) => q + 1)}
                  style={styles.qtyBtn}>
                  <Ionicons name="add" size={16} color={palette.ink.onLightStrong} />
                </Pressable>
              </View>
            </View>

            {/* Reviews */}
            <View style={styles.reviewsHead}>
              <Text style={styles.sectionLabel}>Reviews</Text>
              <Text style={styles.reviewsLink}>See all</Text>
            </View>
            {(product.reviews ?? []).length === 0 ? (
              <Text style={styles.emptyText}>No reviews yet.</Text>
            ) : (product.reviews ?? []).map((r, rIdx) => (
              <View key={r.id || `review-${rIdx}`} style={styles.reviewRow}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewInitial}>{r.author?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewAge}>{r.createdAt ? `· ${formatDate(r.createdAt)}` : r.age ? `· ${r.age}` : ''}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={`star-${r.id || rIdx}-${s}`}
                        name="star"
                        size={11}
                        color={s <= r.rating ? palette.brand.amber : '#D9D9D9'}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>{r.text}</Text>
                </View>
              </View>
            ))}

            {/* eWallet payment card */}
            <View style={styles.payCardWrap}>
              <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.payCard}>
                <View style={styles.payHeader}>
                  <View style={styles.payIconBubble}>
                    <Ionicons name="wallet" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payLabel}>Pay from your eWallet</Text>
                    <Text style={styles.paySub}>Available · {formatKobo(wallet?.balance ?? 0)}</Text>
                  </View>
                </View>
                <Text style={styles.payExplain}>
                  Money leaves your eWallet into Vibe escrow. The vendor sees the payment
                  but it only releases to them when you confirm delivery.
                </Text>

                <View style={styles.payRow}>
                  <Text style={styles.payRowLabel}>Subtotal · {quantity} × {formatNaira(priceNaira)}</Text>
                  <Text style={styles.payRowValue}>{formatNaira(total)}</Text>
                </View>
                {via ? (
                  <View style={styles.payRow}>
                    <Text style={styles.payRowLabel}>Referral · @{via}</Text>
                    <Text style={styles.payRowValue}>Applied by backend</Text>
                  </View>
                ) : null}
                <View style={styles.payRow}>
                  <Text style={styles.payRowLabel}>{PLATFORM_FEE_LABEL}</Text>
                  <Text style={styles.payRowValue}>+{formatNaira(platformFee)}</Text>
                </View>
                <View style={styles.payDivider} />
                <View style={styles.payRow}>
                  <Text style={styles.payTotalLabel}>Estimated total</Text>
                  <Text style={styles.payTotalValue}>{formatNaira(grandTotal)}</Text>
                </View>

                {payState === 'low' ? (
                  <View style={styles.payErr}>
                    <Ionicons name="alert-circle" size={14} color={palette.status.danger} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.payErrText}>
                        Not enough in your eWallet.
                      </Text>
                      <Pressable
                        onPress={() => {
                          topUpWallet.mutate(
                            { amount: nairaToKobo(50000), source: 'Instant Top-Up' },
                            {
                              onSuccess: () => setPayState('idle'),
                            }
                          );
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          paddingVertical: 5,
                          paddingHorizontal: 12,
                          backgroundColor: palette.brand.orange,
                          borderRadius: 6,
                          marginTop: 4,
                        }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontFamily: typography.bodyEmphasis.fontFamily }}>
                          {topUpWallet.isPending ? 'Crediting…' : '+ Top up ₦50,000 instantly'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
                {payState === 'error' && payErrorMsg ? (
                  <View style={styles.payErr}>
                    <Ionicons name="alert-circle" size={14} color={palette.status.danger} />
                    <Text style={styles.payErrText}>{payErrorMsg}</Text>
                  </View>
                ) : null}
                {payState === 'address' ? (
                  <View style={styles.payErr}>
                    <Ionicons name="location-outline" size={14} color={palette.status.danger} />
                    <Text style={styles.payErrText}>
                      Add a saved delivery address before paying from this screen.
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handlePay}
                  disabled={createOrder.isPending || payFromWallet.isPending || payState === 'paid'}
                  style={({ pressed }) => [
                    styles.payCta,
                    ((createOrder.isPending || payFromWallet.isPending) || pressed) && { opacity: 0.85 },
                    payState === 'paid' && { backgroundColor: palette.status.success },
                  ]}>
                  <Ionicons
                    name={
                      payState === 'paid'
                        ? 'checkmark-circle'
                        : createOrder.isPending || payFromWallet.isPending
                        ? 'hourglass'
                        : !defaultAddress
                        ? 'location'
                        : 'lock-closed'
                    }
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.payCtaLabel}>
                    {payState === 'paid'
                      ? 'Paid · awaiting delivery'
                      : createOrder.isPending || payFromWallet.isPending
                      ? 'Securing payment…'
                      : !defaultAddress
                      ? 'Add delivery address'
                      : `Pay ${formatNaira(grandTotal)} est. from eWallet`}
                  </Text>
                </Pressable>

                <View style={styles.secondaryActionsRow}>
                  <Pressable
                    onPress={() => {
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
                          color: activeColor,
                        },
                        quantity,
                      );
                      router.push('/cart');
                    }}
                    style={styles.cartLink}>
                    <Ionicons name="bag-outline" size={14} color={palette.brand.orange} />
                    <Text style={styles.cartLinkLabel}>Add to bag</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      vibeHaptics.selection();
                      addToCart(
                        {
                          id: product.id,
                          name: product.title,
                          price: priceNaira,
                          priceKobo: product.price,
                          image: imageSource,
                          vendor: product.vendor.storeName,
                          vendorId: product.vendorId,
                          color: activeColor,
                        },
                        quantity,
                      );
                      router.push('/checkout');
                    }}
                    style={styles.giftProductLink}>
                    <Ionicons name="gift-outline" size={14} color="#FBBF24" />
                    <Text style={styles.giftProductLinkLabel}>Gift to someone</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </View>
          </>
          )}
        </ScrollView>
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

function productImageSource(product: {
  images?: string[];
  media?: { url: string; type: 'image' | 'video' }[];
} | null | undefined) {
  const url = product?.images?.[0] ?? product?.media?.find((asset) => asset.type === 'image')?.url;
  return url ? { uri: url } : HERO;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  viaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.32)',
  },
  viaText: {
    flex: 1,
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    lineHeight: 17,
  },
  viaHandle: {
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  scroll: { paddingBottom: 40 },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['8'],
    gap: spacing['2'],
  },
  centerText: {
    ...typography.body,
    color: palette.ink.onLightStrong,
    textAlign: 'center',
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
  },
  heroWrap: {
    marginHorizontal: spacing['4'],
    marginTop: spacing['3'],
    borderRadius: radius.xl,
    overflow: 'hidden',
    aspectRatio: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  hero: { width: '100%', height: '100%' },
  body: { paddingHorizontal: spacing['4'], paddingTop: spacing['4'] },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vendorName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 999,
    backgroundColor: palette.status.success,
  },
  kycText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...typography.caption,
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  ratingMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
  },
  followBtn: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  followText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  findNearbyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(47, 107, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.28)',
    marginTop: spacing['2'],
    marginBottom: spacing['1'],
    alignSelf: 'flex-start',
  },
  findNearbyText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
    fontWeight: '600',
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    color: palette.ink.onLightStrong,
    marginTop: spacing['1'],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  price: {
    ...typography.h2,
    fontSize: 22,
    color: palette.brand.orangeDeep,
  },
  oldPrice: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(76,175,80,0.18)',
    justifyContent: 'center',
  },
  discountText: {
    ...typography.small,
    color: palette.status.success,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  sectionLabel: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
    marginTop: spacing['4'],
    marginBottom: spacing['2'],
  },
  description: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    lineHeight: 22,
  },
  swatchRow: { flexDirection: 'row', gap: spacing['2'] },
  swatchWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchWrapOn: { borderColor: palette.brand.orange },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  sizeRow: { flexDirection: 'row', gap: spacing['2'] },
  size: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  sizeOn: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
  sizeLabel: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  sizeLabelOn: { color: '#FFFFFF' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['2'],
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
    minWidth: 18,
    textAlign: 'center',
  },
  reviewsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['4'],
  },
  reviewsLink: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  emptyText: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitial: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewAuthor: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  reviewAge: {
    ...typography.small,
    color: palette.ink.onLightSubtle,
  },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewText: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    marginTop: 4,
    lineHeight: 20,
  },
  payCardWrap: {
    marginTop: spacing['5'],
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(40, 26, 16, 0.25)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 6,
  },
  payCard: { padding: spacing['4'], gap: spacing['2'] },
  payHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  payIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payLabel: {
    ...typography.bodyEmphasis,
    fontSize: 15,
    color: palette.ink.onLightStrong,
  },
  paySub: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 2,
  },
  payExplain: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    lineHeight: 17,
    marginTop: 4,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  payRowLabel: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
  },
  payRowValue: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  payDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: spacing['2'],
  },
  payTotalLabel: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  payTotalValue: {
    ...typography.h2,
    fontSize: 18,
    color: palette.brand.orangeDeep,
  },
  payErr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(244,67,54,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.30)',
  },
  payErrText: {
    flex: 1,
    ...typography.caption,
    color: palette.status.danger,
  },
  payCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    marginTop: spacing['3'],
  },
  payCtaLabel: {
    ...typography.bodyEmphasis,
    fontSize: 15,
    color: '#fff',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: spacing['2'],
  },
  cartLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing['2'],
  },
  cartLinkLabel: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  giftProductLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing['2'],
  },
  giftProductLinkLabel: {
    ...typography.caption,
    color: '#FBBF24',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});
