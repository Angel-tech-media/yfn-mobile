import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
import type { RankedProduct } from '@/src/api/types';
import { vibeHaptics } from '@/src/lib/haptics';
import { useCart } from '@/src/store/cart';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo, koboToNaira } from '@/src/utils/money';
import {
  ProductReviewComposerModal,
  type BuyerReviewPost,
} from './ProductReviewComposerModal';

const PRODUCT_SAMPLE = require('@/assets/figma/product-sample.png');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);

export type QuickViewProduct = {
  id: string;
  title?: string;
  name?: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
  isYfnVerified?: boolean;
  vendorId?: string;
  vendorHandle?: string;
  vendorName?: string;
  vendor?: { id?: string; handle?: string; storeName?: string };
  media?: { type: 'image' | 'video'; url: string }[];
  images?: string[];
  imageUrl?: string;
  variants?: Record<string, any>;
  rating?: number;
  reviewsCount?: number;
};

interface Props {
  product: QuickViewProduct | RankedProduct | null;
  visible: boolean;
  onClose: () => void;
}

type ColorVariant = {
  id: string;
  name: string;
  hex: string;
  accent: string;
  imageUrl: string;
  tag: string;
};

const DEFAULT_COLOR_VARIANTS: ColorVariant[] = [
  {
    id: 'onyx-black',
    name: 'Onyx Black',
    hex: '#181412',
    accent: '#44342A',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    tag: 'Core Edition',
  },
  {
    id: 'cognac-amber',
    name: 'Cognac Amber',
    hex: '#8C4A1F',
    accent: '#D89544',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    tag: 'Trending Colorway',
  },
  {
    id: 'chalk-white',
    name: 'Chalk White',
    hex: '#E8E3DC',
    accent: '#B5ACA1',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    tag: 'Minimalist Drop',
  },
  {
    id: 'forest-emerald',
    name: 'Forest Emerald',
    hex: '#23382B',
    accent: '#3E5C49',
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80',
    tag: 'Limited Run',
  },
];

export type RichProductReview = {
  id: string;
  author: string;
  handle: string;
  rating: number;
  date: string;
  variant: string;
  reviewType: 'tweet' | 'article' | 'video';
  headline?: string;
  comment: string;
  videoUrl?: string | null;
  videoThumbUrl?: string | null;
  sizingVerdict: 'True to Size' | 'Runs Small' | 'Runs Large';
  verified: boolean;
  helpfulCount: number;
};

const INITIAL_RICH_REVIEWS: RichProductReview[] = [
  {
    id: 'rev-vid-1',
    author: 'Chioma E.',
    handle: '@chioma_style',
    rating: 5,
    date: '2d ago',
    variant: 'Cognac Amber / 42',
    reviewType: 'video',
    headline: 'Unboxing & Styling On-Foot Try On',
    comment: 'The leather finish and silhouette feel like bespoke European luxury. Cushioning is 10/10.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoThumbUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    sizingVerdict: 'True to Size',
    verified: true,
    helpfulCount: 38,
  },
  {
    id: 'rev-art-2',
    author: 'Tunde O.',
    handle: '@tunde_x',
    rating: 5,
    date: '4d ago',
    variant: 'Onyx Black / 44',
    reviewType: 'article',
    headline: 'Why This Drop Replaced My High-End Everyday Pair',
    comment: '1. Build Quality: Stitching across the toe box is immaculate.\n2. Anonymous Escrow Delivery: Received the dropoff in 24 hours without sharing private address.\n3. Weight: Unusually light for a boot this substantial.',
    sizingVerdict: 'True to Size',
    verified: true,
    helpfulCount: 29,
  },
  {
    id: 'rev-tweet-3',
    author: 'Zainab A.',
    handle: '@zainab_k',
    rating: 4.8,
    date: '1w ago',
    variant: 'Chalk White / 40',
    reviewType: 'tweet',
    headline: 'Chalk White Verdict ⚡',
    comment: 'Cleanest silhouette in Lagos. Colorway is even crisper in daylight than on-screen. Sizing is spot on.',
    sizingVerdict: 'Runs Small',
    verified: true,
    helpfulCount: 14,
  },
];

export function ProductQuickViewModal({ product, visible, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(700)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const addToCart = useCart((s) => s.add);

  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'variants' | 'reviews'>('variants');
  const [reviews, setReviews] = useState<RichProductReview[]>(INITIAL_RICH_REVIEWS);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'video' | 'article' | 'tweet'>('all');
  const [composerVisible, setComposerVisible] = useState(false);
  const [activeVideoReview, setActiveVideoReview] = useState<RichProductReview | null>(null);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const carouselScrollRef = useRef<any>(null);

  useEffect(() => {
    if (visible && product) {
      vibeHaptics.selection();
      setIsAddedSuccess(false);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 75,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 700,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, product, slideAnim, fadeAnim]);

  // Color variants list
  const variants = useMemo(() => {
    const mainImg =
      product?.media?.find((m) => m.type === 'image')?.url ??
      (product as any)?.imageUrl ??
      (product as any)?.images?.[0];

    return DEFAULT_COLOR_VARIANTS.map((v, i) => {
      if (i === 0 && mainImg) {
        return { ...v, imageUrl: mainImg };
      }
      return v;
    });
  }, [product]);

  const activeVariant = variants[activeVariantIndex] ?? variants[0];

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter((r) => r.reviewType === reviewFilter);
  }, [reviews, reviewFilter]);

  const handleSelectVariant = (index: number) => {
    vibeHaptics.light();
    setActiveVariantIndex(index);
    carouselScrollRef.current?.scrollTo({
      x: index * CAROUSEL_WIDTH,
      animated: true,
    });
  };

  if (!product && !visible) return null;

  const productTitle = (product as any)?.title ?? (product as any)?.name ?? 'Curated Product';
  const priceNaira = koboToNaira(product?.price ?? 0);
  const vendorTarget =
    (product as any)?.vendorId ??
    (product as any)?.vendorHandle ??
    (product as any)?.vendor?.id ??
    (product as any)?.vendor?.handle ??
    '';
  const vendorStoreName =
    (product as any)?.vendor?.storeName ??
    (product as any)?.vendorName ??
    'Verified Boutique';

  const handleAddToCart = () => {
    if (!product) return;
    vibeHaptics.dopamineBurst();
    addToCart(
      {
        id: product.id,
        name: `${productTitle} (${activeVariant.name})`,
        price: priceNaira,
        priceKobo: product.price,
        image: activeVariant.imageUrl ? { uri: activeVariant.imageUrl } : PRODUCT_SAMPLE,
        vendor: vendorStoreName,
        vendorId: vendorTarget || 'vendor',
      },
      1,
    );

    // Show dopamine confirmation animation
    setIsAddedSuccess(true);
    Animated.spring(successScaleAnim, {
      toValue: 1,
      tension: 110,
      friction: 7,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setIsAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleBuyNow = () => {
    if (!product) return;
    vibeHaptics.medium();
    addToCart(
      {
        id: product.id,
        name: `${productTitle} (${activeVariant.name})`,
        price: priceNaira,
        priceKobo: product.price,
        image: activeVariant.imageUrl ? { uri: activeVariant.imageUrl } : PRODUCT_SAMPLE,
        vendor: vendorStoreName,
        vendorId: vendorTarget || 'vendor',
      },
      1,
    );
    onClose();
    router.push('/checkout');
  };

  const handleViewDetails = () => {
    if (!product) return;
    vibeHaptics.selection();
    onClose();
    router.push(`/product/${product.id}` as never);
  };

  const handleVisitVendor = () => {
    if (!product) return;
    vibeHaptics.selection();
    onClose();
    const target = vendorTarget || product.id;
    router.push(`/place/${target}` as never);
  };

  const handleNewReviewPublished = (newRev: BuyerReviewPost) => {
    const formatted: RichProductReview = {
      id: newRev.id,
      author: newRev.author,
      handle: newRev.handle,
      rating: newRev.rating,
      date: 'Just now',
      variant: `${activeVariant.name} / Verified`,
      reviewType: newRev.reviewType,
      headline: newRev.headline,
      comment: newRev.body,
      videoUrl: newRev.videoUrl,
      videoThumbUrl: newRev.imageUrls?.[0] ?? activeVariant.imageUrl,
      sizingVerdict: newRev.sizingVerdict,
      verified: true,
      helpfulCount: 1,
    };
    setReviews([formatted, ...reviews]);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Frosted blurred backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.androidBackdrop} />
          )}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Morphing Partial Bottom Card Sheet (~88% height) */}
        <Animated.View style={[styles.cardContainer, { transform: [{ translateY: slideAnim }] }]}>
          {/* Tactile drag indicator bar */}
          <View style={styles.handleBarWrap}>
            <View style={styles.handleBar} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}>
            
            {/* Header: Title, Category & Price */}
            <View style={styles.headerBlock}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1, paddingRight: spacing['3'] }}>
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryBadgeText}>
                      {product?.category ?? 'Footwear & Apparel'}
                    </Text>
                    <View style={styles.dotSeparator} />
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={11} color="#F4C464" />
                      <Text style={styles.ratingText}>4.9 ({reviews.length} reviews)</Text>
                    </View>
                  </View>
                  <Text style={styles.title} numberOfLines={2}>
                    {productTitle}
                  </Text>
                </View>

                <View style={styles.priceColumn}>
                  <Text style={styles.price}>{product ? formatKobo(product.price) : '₦0'}</Text>
                  <View style={styles.stockPill}>
                    <View style={styles.stockDot} />
                    <Text style={styles.stockText}>In Stock</Text>
                  </View>
                </View>
              </View>

              {/* Close Button in Header */}
              <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* TAB SELECTOR: (Colorways Carousel) vs (Shoppable Buyer Reviews) */}
            <View style={styles.tabSelector}>
              <Pressable
                onPress={() => {
                  vibeHaptics.light();
                  setActiveTab('variants');
                }}
                style={[styles.tabBtn, activeTab === 'variants' && styles.tabBtnActive]}>
                <Ionicons
                  name="color-palette-outline"
                  size={14}
                  color={activeTab === 'variants' ? palette.brand.orange : palette.ink.onDarkMuted}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'variants' && styles.tabBtnTextActive,
                  ]}>
                  Colorways & Variants ({variants.length})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  vibeHaptics.light();
                  setActiveTab('reviews');
                }}
                style={[styles.tabBtn, activeTab === 'reviews' && styles.tabBtnActive]}>
                <Ionicons
                  name="newspaper-outline"
                  size={14}
                  color={activeTab === 'reviews' ? palette.brand.orange : palette.ink.onDarkMuted}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'reviews' && styles.tabBtnTextActive,
                  ]}>
                  Buyer Reviews ({reviews.length})
                </Text>
              </Pressable>
            </View>

            {/* TAB 1: SWIPING COLORWAY / VERSION CAROUSEL */}
            {activeTab === 'variants' ? (
              <View style={styles.variantsSection}>
                {/* Carousel Frame */}
                <View style={styles.carouselContainer}>
                  <ScrollView
                    ref={carouselScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CAROUSEL_WIDTH}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
                      if (idx !== activeVariantIndex && idx >= 0 && idx < variants.length) {
                        vibeHaptics.light();
                        setActiveVariantIndex(idx);
                      }
                    }}>
                    {variants.map((variant, i) => (
                      <View key={variant.id ? `variant-${variant.id}-${i}` : `variant-${i}`} style={[styles.carouselSlide, { width: CAROUSEL_WIDTH }]}>
                        <Image
                          source={{ uri: variant.imageUrl }}
                          style={styles.carouselImg}
                          contentFit="cover"
                        />
                        <LinearGradient
                          colors={['transparent', 'rgba(18, 12, 8, 0.85)']}
                          locations={[0.55, 1]}
                          style={StyleSheet.absoluteFill}
                        />

                        {/* Floating Variant Badge */}
                        <View style={styles.slideOverlay}>
                          <View style={styles.variantTagBadge}>
                            <View style={[styles.variantColorBlob, { backgroundColor: variant.hex }]} />
                            <Text style={styles.variantTagText}>{variant.name}</Text>
                          </View>
                          <Text style={styles.variantSubtag}>{variant.tag}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Carousel Page Dots */}
                  <View style={styles.dotsRow}>
                    {variants.map((v, i) => (
                      <Pressable
                        key={`dot-${v.id}`}
                        onPress={() => handleSelectVariant(i)}
                        style={[styles.dot, i === activeVariantIndex && styles.dotActive]}
                      />
                    ))}
                  </View>
                </View>

                {/* Interactive Color Swatch Bar */}
                <View style={styles.swatchSection}>
                  <Text style={styles.swatchLabel}>
                    Selected Edition: <Text style={styles.swatchLabelBold}>{activeVariant.name}</Text>
                  </Text>

                  <View style={styles.swatchPillsRow}>
                    {variants.map((v, i) => {
                      const isSelected = i === activeVariantIndex;
                      return (
                        <Pressable
                          key={`pill-${v.id}`}
                          onPress={() => handleSelectVariant(i)}
                          style={[
                            styles.swatchPill,
                            isSelected && styles.swatchPillSelected,
                          ]}>
                          <View style={[styles.swatchCircle, { backgroundColor: v.hex }]} />
                          <Text
                            style={[
                              styles.swatchPillName,
                              isSelected && styles.swatchPillNameSelected,
                            ]}>
                            {v.name}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={13} color={palette.brand.orange} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Escrow Guarantee Pill */}
                <View style={styles.escrowBanner}>
                  <Ionicons name="shield-checkmark" size={16} color="#4ADE80" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.escrowTitle}>Zero-Knowledge Escrow Protection</Text>
                    <Text style={styles.escrowSub}>
                      Vendor receives payment only after you inspect and accept this delivery.
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* TAB 2: RICH BUYER PRODUCT REVIEWS & LOOKBOOKS */
              <View style={styles.reviewsSection}>
                {/* Repost & Review Drop Header Banner */}
                <View style={styles.repostBannerCard}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.repostBannerTitle}>Purchased or Styled This Drop?</Text>
                    <Text style={styles.repostBannerSub}>
                      Repost with an article lookbook, tweet review, or video try-on
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      vibeHaptics.selection();
                      setComposerVisible(true);
                    }}
                    style={styles.repostActionBtn}>
                    <Ionicons name="create-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.repostActionBtnText}>+ Write Review</Text>
                  </Pressable>
                </View>

                {/* Rating Score Summary */}
                <View style={styles.ratingSummaryCard}>
                  <View style={styles.ratingBigCol}>
                    <Text style={styles.ratingBigNumber}>4.9</Text>
                    <View style={styles.ratingStarsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={14} color="#F4C464" />
                      ))}
                    </View>
                    <Text style={styles.ratingTotalText}>Based on 48 verified drops</Text>
                  </View>

                  <View style={styles.ratingBarsCol}>
                    <View style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>5★</Text>
                      <View style={styles.ratingBarTrack}>
                        <View style={[styles.ratingBarFill, { width: '88%' }]} />
                      </View>
                    </View>
                    <View style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>4★</Text>
                      <View style={styles.ratingBarTrack}>
                        <View style={[styles.ratingBarFill, { width: '10%' }]} />
                      </View>
                    </View>
                    <View style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>3★</Text>
                      <View style={styles.ratingBarTrack}>
                        <View style={[styles.ratingBarFill, { width: '2%' }]} />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Review Type Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                  {[
                    { key: 'all', label: `All (${reviews.length})` },
                    { key: 'video', label: '🎬 Video Try-Ons' },
                    { key: 'article', label: '📰 Lookbook Articles' },
                    { key: 'tweet', label: '💬 Tweet Verdicts' },
                  ].map((f) => (
                    <Pressable
                      key={f.key}
                      onPress={() => {
                        vibeHaptics.light();
                        setReviewFilter(f.key as any);
                      }}
                      style={[
                        styles.filterChip,
                        reviewFilter === f.key && styles.filterChipActive,
                      ]}>
                      <Text
                        style={[
                          styles.filterChipText,
                          reviewFilter === f.key && styles.filterChipTextActive,
                        ]}>
                        {f.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Rich Reviews List */}
                <View style={styles.commentsList}>
                  {filteredReviews.map((item, idx) => (
                    <View key={item.id ? `review-${item.id}-${idx}` : `review-${idx}`} style={styles.reviewCardWrap}>
                      {/* Review Card Header */}
                      <View style={styles.commentHead}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarInitial}>{item.author[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.commentAuthorRow}>
                            <Text style={styles.commentAuthorName}>{item.author}</Text>
                            <Text style={styles.commentHandleText}>{item.handle}</Text>
                            {item.verified && (
                              <View style={styles.verifiedBuyerTag}>
                                <Ionicons name="checkmark-circle" size={10} color="#4ADE80" />
                                <Text style={styles.verifiedBuyerText}>Verified Buyer</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.commentVariantTag}>{item.variant} · {item.date}</Text>
                        </View>
                        <View style={styles.commentStars}>
                          <Ionicons name="star" size={11} color="#F4C464" />
                          <Text style={styles.commentStarsText}>{item.rating.toFixed(1)}</Text>
                        </View>
                      </View>

                      {/* Video Review Thumbnail Card */}
                      {item.reviewType === 'video' && item.videoThumbUrl ? (
                        <Pressable
                          onPress={() => {
                            vibeHaptics.selection();
                            setActiveVideoReview(item);
                          }}
                          style={styles.videoPreviewWrap}>
                          <Image source={{ uri: item.videoThumbUrl }} style={styles.videoPreviewImage} contentFit="cover" />
                          <LinearGradient
                            colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                            style={StyleSheet.absoluteFill}
                          />
                          <View style={styles.playButtonCircle}>
                            <Ionicons name="play" size={20} color="#FFFFFF" />
                          </View>
                          <View style={styles.videoDurationPill}>
                            <Ionicons name="videocam" size={10} color="#FFFFFF" />
                            <Text style={styles.videoDurationText}>Video Try-On · Tap to Play</Text>
                          </View>

                          {/* Floating Product Tag overlay on video */}
                          <View style={styles.videoProductTag}>
                            <Ionicons name="pricetag" size={11} color={palette.brand.orange} />
                            <Text style={styles.videoProductTagText} numberOfLines={1}>
                              Tagged: {productTitle} ({formatKobo(product?.price ?? 0)})
                            </Text>
                          </View>
                        </Pressable>
                      ) : null}

                      {/* Article Headline */}
                      {item.headline ? (
                        <Text style={styles.reviewHeadline}>{item.headline}</Text>
                      ) : null}

                      {/* Review Content */}
                      <Text style={styles.commentBody}>{item.comment}</Text>

                      {/* Attached Product Action Card inside review */}
                      <Pressable
                        onPress={handleAddToCart}
                        style={styles.reviewAttachedProductCard}>
                        <Ionicons name="bag-handle" size={14} color={palette.brand.orange} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.attachedProductTitle} numberOfLines={1}>
                            Buy {productTitle}
                          </Text>
                          <Text style={styles.attachedProductPrice}>
                            {formatKobo(product?.price ?? 0)} · Sizing: {item.sizingVerdict}
                          </Text>
                        </View>
                        <View style={styles.quickAddPill}>
                          <Text style={styles.quickAddPillText}>+ Add to Bag</Text>
                        </View>
                      </Pressable>

                      <View style={styles.commentFoot}>
                        <View style={styles.sizingVerdictBadge}>
                          <Ionicons name="shield-checkmark" size={11} color="#4ADE80" />
                          <Text style={styles.sizingVerdictText}>Fit: {item.sizingVerdict}</Text>
                        </View>

                        <Pressable
                          onPress={() => vibeHaptics.light()}
                          style={styles.helpfulBtn}>
                          <Ionicons name="thumbs-up-outline" size={12} color={palette.ink.onDarkMuted} />
                          <Text style={styles.helpfulText}>Helpful ({item.helpfulCount})</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Quick Actions (Add to Bag / Buy Now) */}
            <View style={styles.actionButtonsRow}>
              <PressableScale
                onPress={handleAddToCart}
                haptic="medium"
                scaleTo={0.95}
                style={styles.cartBtn}>
                <Ionicons name="bag-add-outline" size={18} color="#D89544" />
                <Text style={styles.cartBtnText}>Add to Bag</Text>
              </PressableScale>

              <PressableScale
                onPress={handleBuyNow}
                haptic="heavy"
                scaleTo={0.95}
                style={styles.buyBtn}>
                <LinearGradient
                  colors={['#D89544', '#A6692E']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
                <Ionicons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.buyBtnText}>Instant Buy</Text>
              </PressableScale>
            </View>

            <View style={styles.divider} />

            {/* Dual Destination Navigation (Explicit separation as requested) */}
            <View style={styles.navRow}>
              {/* Option 1: Full Product Page Details */}
              <PressableScale
                onPress={handleViewDetails}
                haptic="light"
                scaleTo={0.97}
                style={styles.navLinkCard}>
                <View style={styles.navIconBubble}>
                  <Ionicons name="document-text-outline" size={18} color="#D89544" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.navLinkTitle}>Full Story & Specifications</Text>
                  <Text style={styles.navLinkSub}>Fabric, size guide & sizing table</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.ink.onDarkMuted} />
              </PressableScale>

              {/* Option 2: Visit Vendor Store Page */}
              <PressableScale
                onPress={handleVisitVendor}
                haptic="light"
                scaleTo={0.97}
                style={styles.navLinkCard}>
                <View style={styles.navIconBubble}>
                  <Ionicons name="storefront-outline" size={18} color="#D89544" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.navLinkTitle}>Visit Vendor Store</Text>
                  <Text style={styles.navLinkSub}>
                    {vendorStoreName} · Browse entire boutique
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.ink.onDarkMuted} />
              </PressableScale>
            </View>
          </ScrollView>

          {/* Dopamine Added to Bag Micro-Celebration Overlay */}
          {isAddedSuccess && (
            <Animated.View
              style={[
                styles.successOverlay,
                { transform: [{ scale: successScaleAnim }] },
              ]}>
              <View style={styles.successCard}>
                <LinearGradient
                  colors={['#2A1D16', '#140E0A']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.successTitle}>Added to Your Bag!</Text>
                <Text style={styles.successSub}>{activeVariant.name} edition reserved</Text>
              </View>
            </Animated.View>
          )}

          {/* Video Try-On Player Preview Modal */}
          {activeVideoReview && (
            <Modal visible={!!activeVideoReview} transparent animationType="fade" onRequestClose={() => setActiveVideoReview(null)}>
              <View style={styles.videoModalOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveVideoReview(null)}>
                  <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <View style={styles.videoPlayerCard}>
                  {/* Video Thumbnail Viewport */}
                  <Image source={{ uri: activeVideoReview.videoThumbUrl ?? '' }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.9)']}
                    locations={[0, 0.4, 1]}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Top Close Row */}
                  <View style={styles.videoPlayerHead}>
                    <View style={styles.videoAuthorPill}>
                      <Text style={styles.videoAuthorPillText}>{activeVideoReview.author} ({activeVideoReview.handle})</Text>
                      <View style={styles.verifiedBuyerTag}>
                        <Ionicons name="checkmark-circle" size={10} color="#4ADE80" />
                      </View>
                    </View>
                    <Pressable onPress={() => setActiveVideoReview(null)} style={styles.videoCloseCircle}>
                      <Ionicons name="close" size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {/* Play Pulse Icon */}
                  <View style={styles.videoCenterPlay}>
                    <Ionicons name="play" size={32} color="#FFFFFF" />
                  </View>

                  {/* Floating Shoppable Product Drawer popping up right over video */}
                  <View style={styles.videoShoppableCard}>
                    <View style={styles.videoShoppableThumb}>
                      <Image source={{ uri: activeVariant.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.videoShoppableTitle} numberOfLines={1}>{productTitle}</Text>
                      <Text style={styles.videoShoppablePrice}>{formatKobo(product?.price ?? 0)} · In Stock</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        handleAddToCart();
                        setActiveVideoReview(null);
                      }}
                      style={styles.videoShoppableBuyBtn}>
                      <Ionicons name="bag-handle" size={14} color="#FFFFFF" />
                      <Text style={styles.videoShoppableBuyText}>Buy</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {/* Product Review Composer Modal */}
          {product ? (
            <ProductReviewComposerModal
              visible={composerVisible}
              onClose={() => setComposerVisible(false)}
              product={{
                id: product.id,
                title: productTitle,
                price: product.price,
                imageUrl: activeVariant.imageUrl,
                vendorName: vendorStoreName,
                vendorHandle: vendorTarget,
              }}
              onPublished={handleNewReviewPublished}
            />
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 6, 4, 0.85)',
  },
  cardContainer: {
    backgroundColor: '#16110E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.28)',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  handleBarWrap: {
    alignItems: 'center',
    paddingTop: spacing['3'],
    paddingBottom: spacing['1'],
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  scrollContent: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['8'],
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing['2'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: palette.ink.onDarkMuted,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#F4C464',
    fontWeight: '600',
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
    letterSpacing: -0.2,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 18,
    color: '#F4C464',
    fontWeight: '800',
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4ADE80',
  },
  stockText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: '#4ADE80',
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing['2'],
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: radius.md,
    padding: 3,
    marginVertical: spacing['3'],
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(47, 107, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.3)',
  },
  tabBtnText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  variantsSection: {
    gap: spacing['3'],
  },
  carouselContainer: {
    alignItems: 'center',
    marginTop: spacing['1'],
  },
  carouselSlide: {
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#121833',
  },
  carouselImg: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: spacing['3'],
    left: spacing['3'],
    right: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['2'],
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  variantColorBlob: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  variantTagText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  variantSubtag: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['2'],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 18,
    backgroundColor: palette.brand.orange,
  },
  swatchSection: {
    gap: spacing['2'],
    marginTop: spacing['1'],
  },
  swatchLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  swatchLabelBold: {
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  swatchPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  swatchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  swatchPillSelected: {
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
    borderColor: palette.brand.orange,
  },
  swatchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  swatchPillName: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  swatchPillNameSelected: {
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    marginTop: spacing['1'],
  },
  escrowTitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '700',
  },
  escrowSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  reviewsSection: {
    gap: spacing['3'],
  },
  repostBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.3)',
    gap: spacing['2'],
  },
  repostBannerTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  repostBannerSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  repostActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.brand.orange,
    paddingHorizontal: spacing['3'],
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  repostActionBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ratingSummaryCard: {
    flexDirection: 'row',
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing['3'],
  },
  ratingBigCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing['3'],
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  ratingBigNumber: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    color: '#F4C464',
    fontWeight: '800',
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 2,
  },
  ratingTotalText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    color: palette.ink.onDarkMuted,
  },
  ratingBarsCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBarLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
    width: 16,
  },
  ratingBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#F4C464',
    borderRadius: 2,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
    borderColor: palette.brand.orange,
  },
  filterChipText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  commentsList: {
    gap: spacing['3'],
  },
  reviewCardWrap: {
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 107, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarInitial: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
    fontWeight: '700',
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentAuthorName: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  commentHandleText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  verifiedBuyerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  verifiedBuyerText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    color: '#4ADE80',
    fontWeight: '700',
  },
  commentVariantTag: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  commentStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  commentStarsText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#F4C464',
    fontWeight: '700',
  },
  videoPreviewWrap: {
    height: 140,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#121833',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(47, 107, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  videoDurationPill: {
    position: 'absolute',
    top: spacing['2'],
    left: spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  videoDurationText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  videoProductTag: {
    position: 'absolute',
    bottom: spacing['2'],
    left: spacing['2'],
    right: spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['2'],
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  videoProductTagText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reviewHeadline: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  commentBody: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
    lineHeight: 18,
  },
  reviewAttachedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['2'],
    borderRadius: radius.sm,
    backgroundColor: 'rgba(47, 107, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.2)',
  },
  attachedProductTitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  attachedProductPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.brand.orange,
  },
  quickAddPill: {
    backgroundColor: palette.brand.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  quickAddPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  commentFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  sizingVerdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sizingVerdictText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: '#4ADE80',
    fontWeight: '600',
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginTop: spacing['4'],
  },
  cartBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  cartBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: palette.brand.orange,
    fontWeight: '700',
  },
  buyBtn: {
    flex: 1.2,
    height: 48,
    borderRadius: radius.pill,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  buyBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: spacing['4'],
  },
  navRow: {
    gap: spacing['2'],
  },
  navLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navIconBubble: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLinkTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  navLinkSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 6, 4, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4'],
  },
  successCard: {
    width: '85%',
    padding: spacing['6'],
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.brand.orange,
    gap: spacing['2'],
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  successTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
    fontWeight: '800',
  },
  successSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  videoPlayerCard: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#1E120A',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
    justifyContent: 'space-between',
    padding: spacing['4'],
  },
  videoPlayerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  videoAuthorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  videoAuthorPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  videoCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCenterPlay: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(47, 107, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  videoShoppableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(22, 17, 14, 0.95)',
    borderWidth: 1,
    borderColor: palette.brand.orange,
    zIndex: 10,
  },
  videoShoppableThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#3A2818',
  },
  videoShoppableTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  videoShoppablePrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
  },
  videoShoppableBuyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.brand.orange,
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  videoShoppableBuyText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
