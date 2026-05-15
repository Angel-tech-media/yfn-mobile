import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
import { useCart } from '@/src/store/cart';
import {
  REFERRAL_FEE_NGN,
  useEngagement,
  useIsReposted,
} from '@/src/store/engagement';
import { useOrders } from '@/src/store/orders';
import { useWallet } from '@/src/store/wallet';
import { useIsWishlisted, useWishlist } from '@/src/store/wishlist';
import { palette, radius, spacing, typography } from '@/src/theme';

const HERO = require('@/assets/figma/product-sample.png');
const STORY_1 = require('@/assets/figma/story-1.png');
const STORY_2 = require('@/assets/figma/story-2.png');
const STORY_3 = require('@/assets/figma/story-3.png');

const PRICE = 24990;
const COLORS = [
  { key: 'cream', hex: '#E8DDC8', label: 'Cream' },
  { key: 'navy', hex: '#1A2C44', label: 'Navy' },
  { key: 'forest', hex: '#284E3A', label: 'Forest' },
  { key: 'orange', hex: '#D89544', label: 'Honey' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const REVIEWS = [
  { author: 'Bisi A.', initial: 'B', rating: 5, age: '3 days ago', text: 'Fit me like it was custom. Worth every naira.' },
  { author: 'Tunde O.', initial: 'T', rating: 5, age: '1 week ago', text: 'Quality fabric, fast delivery. Will reorder.' },
  { author: 'Chioma I.', initial: 'C', rating: 4, age: '3 weeks ago', text: 'Great gown, a day late but vendor was responsive.' },
];

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG');

export default function ProductDetailScreen() {
  const { id, via } = useLocalSearchParams<{ id: string; via?: string }>();
  const [activeColor, setActiveColor] = useState('cream');
  const [activeSize, setActiveSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const liked = useIsWishlisted(String(id));
  const toggleWishlist = useWishlist((s) => s.toggle);
  const [repostOpen, setRepostOpen] = useState(false);
  const [payState, setPayState] = useState<'idle' | 'paying' | 'paid' | 'low'>('idle');

  const reposted = useIsReposted(String(id));
  const balance = useWallet((s) => s.balance);
  const payFromWallet = useWallet((s) => s.payFromWallet);
  const addToCart = useCart((s) => s.add);
  const addOrder = useOrders((s) => s.add);
  const recordRepostSale = useEngagement((s) => s.recordRepostSale);

  const total = PRICE * quantity;
  const referralSurcharge = via ? REFERRAL_FEE_NGN : 0;
  const platformFee = computePlatformFee(total);
  const grandTotal = total + referralSurcharge + platformFee;

  const handlePay = () => {
    setPayState('paying');
    setTimeout(() => {
      const orderId = `ord-${Date.now().toString().slice(-6)}`;
      const result = payFromWallet({
        amount: grandTotal,
        orderId,
        vendor: "Sarah's Boutique",
      });
      if (!result.ok) {
        setPayState('low');
        return;
      }
      addOrder({
        id: orderId,
        vendor: "Sarah's Boutique",
        vendorHandle: 'sarahsboutique',
        items: [
          {
            name: 'Ankara high shoulder fitted gown',
            qty: quantity,
            unit: PRICE,
          },
        ],
        referrerHandle: via,
      });
      if (via) {
        recordRepostSale({ productId: String(id), feeNgn: REFERRAL_FEE_NGN });
      }
      setPayState('paid');
      setTimeout(() => router.replace('/order-confirmed' as never), 800);
    }, 700);
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
              onPress={() =>
                toggleWishlist({
                  id: String(id),
                  name: 'Ankara high shoulder fitted gown',
                  price: PRICE,
                  image: HERO,
                  vendor: "Sarah's Boutique",
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
              You're here via <Text style={styles.viaHandle}>@{via}</Text>'s repost.
              +₦{REFERRAL_FEE_NGN} goes to them.
            </Text>
            <Ionicons name="chevron-forward" size={14} color={palette.ink.onLightSubtle} />
          </Pressable>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <View style={styles.heroWrap}>
            <Image source={HERO} style={styles.hero} contentFit="cover" />
          </View>

          <View style={styles.body}>
            {/* Vendor row + name + price */}
            <Pressable
              onPress={() => router.push('/u/sarahsboutique' as never)}
              style={styles.vendorRow}>
              <Image source={STORY_1} style={styles.vendorAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.vendorNameRow}>
                  <Text style={styles.vendorName}>Sarah's Boutique</Text>
                  <View style={styles.kycBadge}>
                    <Ionicons name="shield-checkmark" size={10} color="#fff" />
                    <Text style={styles.kycText}>YFN</Text>
                  </View>
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color={palette.brand.amber} />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.ratingMeta}>(64 reviews) · 0.7 km</Text>
                </View>
              </View>
              <View style={styles.followBtn}>
                <Text style={styles.followText}>Follow</Text>
              </View>
            </Pressable>

            <Text style={styles.title}>Ankara high shoulder fitted gown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{fmt(PRICE)}</Text>
              <Text style={styles.oldPrice}>₦26,250</Text>
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>Save 5%</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>
              A statement Ankara gown with a high-shoulder silhouette and a fitted waist.
              Hand-embroidered from premium African wax fabric. Limited Lagos run —
              ships in 3 days from Victoria Island. Free fitting tweak within 7 days.
            </Text>

            {/* Colour */}
            <Text style={styles.sectionLabel}>Colour</Text>
            <View style={styles.swatchRow}>
              {COLORS.map((c) => {
                const on = activeColor === c.key;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setActiveColor(c.key)}
                    style={[styles.swatchWrap, on && styles.swatchWrapOn]}>
                    <View style={[styles.swatch, { backgroundColor: c.hex }]} />
                  </Pressable>
                );
              })}
            </View>

            {/* Size */}
            <Text style={styles.sectionLabel}>Size</Text>
            <View style={styles.sizeRow}>
              {SIZES.map((s) => {
                const on = activeSize === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setActiveSize(s)}
                    style={[styles.size, on && styles.sizeOn]}>
                    <Text style={[styles.sizeLabel, on && styles.sizeLabelOn]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>

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
            {REVIEWS.map((r) => (
              <View key={r.author} style={styles.reviewRow}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewInitial}>{r.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewAge}>· {r.age}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
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
                    <Text style={styles.paySub}>Available · {fmt(balance)}</Text>
                  </View>
                </View>
                <Text style={styles.payExplain}>
                  Money leaves your eWallet into Vibe escrow. The vendor sees the payment
                  but it only releases to them when you confirm delivery.
                </Text>

                <View style={styles.payRow}>
                  <Text style={styles.payRowLabel}>Subtotal · {quantity} × {fmt(PRICE)}</Text>
                  <Text style={styles.payRowValue}>{fmt(total)}</Text>
                </View>
                {via ? (
                  <View style={styles.payRow}>
                    <Text style={styles.payRowLabel}>Referral · @{via}</Text>
                    <Text style={styles.payRowValue}>+₦{REFERRAL_FEE_NGN}</Text>
                  </View>
                ) : null}
                <View style={styles.payRow}>
                  <Text style={styles.payRowLabel}>{PLATFORM_FEE_LABEL}</Text>
                  <Text style={styles.payRowValue}>+₦{platformFee.toLocaleString()}</Text>
                </View>
                <View style={styles.payDivider} />
                <View style={styles.payRow}>
                  <Text style={styles.payTotalLabel}>Total</Text>
                  <Text style={styles.payTotalValue}>{fmt(grandTotal)}</Text>
                </View>

                {payState === 'low' ? (
                  <View style={styles.payErr}>
                    <Ionicons name="alert-circle" size={14} color={palette.status.danger} />
                    <Text style={styles.payErrText}>
                      Not enough in your eWallet. Top up to continue.
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handlePay}
                  disabled={payState === 'paying' || payState === 'paid'}
                  style={({ pressed }) => [
                    styles.payCta,
                    (payState === 'paying' || pressed) && { opacity: 0.85 },
                    payState === 'paid' && { backgroundColor: palette.status.success },
                  ]}>
                  <Ionicons
                    name={
                      payState === 'paid'
                        ? 'checkmark-circle'
                        : payState === 'paying'
                        ? 'hourglass'
                        : 'lock-closed'
                    }
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.payCtaLabel}>
                    {payState === 'paid'
                      ? 'Paid · awaiting delivery'
                      : payState === 'paying'
                      ? 'Securing payment…'
                      : `Pay ${fmt(grandTotal)} from eWallet`}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    addToCart(
                      {
                        id: String(id),
                        name: 'Ankara high shoulder fitted gown',
                        price: PRICE,
                        image: HERO,
                        vendor: "Sarah's Boutique",
                        color: activeColor,
                      },
                      quantity,
                    );
                    router.push('/cart');
                  }}
                  style={styles.cartLink}>
                  <Ionicons name="bag-outline" size={14} color={palette.brand.orange} />
                  <Text style={styles.cartLinkLabel}>Add to cart instead</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </SafeAreaView>

      <RepostSheet
        visible={repostOpen}
        onClose={() => setRepostOpen(false)}
        product={{
          id: String(id),
          name: 'Ankara high shoulder fitted gown',
          price: fmt(PRICE),
          vendor: "Sarah's Boutique",
          vendorId: 'sarahsboutique',
        }}
      />
    </EspressoBackground>
  );
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    backgroundColor: 'rgba(216, 149, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68, 0.32)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    borderColor: 'rgba(255, 255, 255, 0.55)',
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
  cartLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing['2'],
    marginTop: spacing['2'],
  },
  cartLinkLabel: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});
