import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { vibeHaptics } from '@/src/lib/haptics';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useToast } from '@/src/hooks/use-toast';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type BuyerReviewPost = {
  id: string;
  author: string;
  handle: string;
  authorAvatarUrl?: string | null;
  productTitle: string;
  productId: string;
  productPrice: number;
  productImageUrl?: string;
  vendorName: string;
  vendorHandle: string;
  reviewType: 'tweet' | 'article' | 'video';
  headline?: string;
  body: string;
  rating: number;
  videoUrl?: string | null;
  imageUrls: string[];
  sizingVerdict: 'True to Size' | 'Runs Small' | 'Runs Large';
  date: string;
  likesCount: number;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    vendorName?: string;
    vendorHandle?: string;
  } | null;
  onPublished?: (review: BuyerReviewPost) => void;
}

export function ProductReviewComposerModal({
  visible,
  onClose,
  product,
  onPublished,
}: Props) {
  const [reviewType, setReviewType] = useState<'tweet' | 'article'>('tweet');
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [sizingVerdict, setSizingVerdict] = useState<'True to Size' | 'Runs Small' | 'Runs Large'>('True to Size');
  const [attachedMedia, setAttachedMedia] = useState<PickedImage[]>([]);
  const [hasVideoAttached, setHasVideoAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { pick, pickMany } = useImagePicker();
  const toast = useToast();

  if (!visible || !product) return null;

  const handlePickPhotos = async () => {
    vibeHaptics.light();
    const imgs = await pickMany(4 - attachedMedia.length);
    if (imgs.length) {
      setAttachedMedia([...attachedMedia, ...imgs].slice(0, 4));
    }
  };

  const handleToggleVideo = () => {
    vibeHaptics.selection();
    setHasVideoAttached((prev) => !prev);
  };

  const handleSubmit = () => {
    if (!bodyText.trim()) {
      toast.show({ variant: 'error', title: 'Please write your review thoughts' });
      return;
    }

    vibeHaptics.dopamineBurst();
    setSubmitting(true);

    const newReview: BuyerReviewPost = {
      id: `rev-${Date.now()}`,
      author: 'You',
      handle: '@you',
      productTitle: product.title,
      productId: product.id,
      productPrice: product.price,
      productImageUrl: product.imageUrl,
      vendorName: product.vendorName ?? 'Verified Vendor',
      vendorHandle: product.vendorHandle ?? 'vendor',
      reviewType: hasVideoAttached ? 'video' : reviewType,
      headline: headline.trim() || undefined,
      body: bodyText.trim(),
      rating,
      sizingVerdict,
      imageUrls: attachedMedia.map((m) => m.uri),
      videoUrl: hasVideoAttached
        ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        : null,
      date: 'Just now',
      likesCount: 1,
    };

    setTimeout(() => {
      setSubmitting(false);
      onPublished?.(newReview);
      toast.show({ variant: 'success', title: 'Product Review Published to Feed! 🎉' });
      onClose();
      // Reset
      setHeadline('');
      setBodyText('');
      setAttachedMedia([]);
      setHasVideoAttached(false);
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>

        <View style={styles.sheetCard}>
          {/* Top Handle */}
          <View style={styles.handleBarWrap}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.headRow}>
            <View>
              <Text style={styles.sheetTitle}>Review & Repost Drop</Text>
              <Text style={styles.sheetSub}>Write an article, tweet review, or attach a video</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Tagged Product Anchor Card */}
            <View style={styles.productAnchorCard}>
              <View style={styles.productThumbWrap}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.productThumb} contentFit="cover" />
                ) : (
                  <View style={[styles.productThumb, { backgroundColor: '#2C1D14' }]} />
                )}
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.taggedBadge}>
                  <Ionicons name="pricetag" size={10} color={palette.brand.orange} />
                  <Text style={styles.taggedBadgeText}>Tagged Product</Text>
                </View>
                <Text style={styles.anchorTitle} numberOfLines={1}>{product.title}</Text>
                <Text style={styles.anchorPrice}>{formatKobo(product.price)} · by @{product.vendorHandle ?? 'vendor'}</Text>
              </View>

              <View style={styles.verifiedCheck}>
                <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
              </View>
            </View>

            {/* FORMAT SELECTOR: (Tweet-Style Verdict) vs (Article-Style Longform) */}
            <View style={styles.formatSelector}>
              <Pressable
                onPress={() => {
                  vibeHaptics.light();
                  setReviewType('tweet');
                }}
                style={[styles.formatBtn, reviewType === 'tweet' && styles.formatBtnActive]}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={14}
                  color={reviewType === 'tweet' ? palette.brand.orange : palette.ink.onDarkMuted}
                />
                <Text style={[styles.formatBtnText, reviewType === 'tweet' && styles.formatBtnTextActive]}>
                  Tweet Verdict (Punchy)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  vibeHaptics.light();
                  setReviewType('article');
                }}
                style={[styles.formatBtn, reviewType === 'article' && styles.formatBtnActive]}>
                <Ionicons
                  name="newspaper-outline"
                  size={14}
                  color={reviewType === 'article' ? palette.brand.orange : palette.ink.onDarkMuted}
                />
                <Text style={[styles.formatBtnText, reviewType === 'article' && styles.formatBtnTextActive]}>
                  Article Review (Lookbook)
                </Text>
              </Pressable>
            </View>

            {/* Star Rating Selector */}
            <View style={styles.ratingRow}>
              <Text style={styles.fieldLabel}>Your Verdict:</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => {
                      vibeHaptics.selection();
                      setRating(star);
                    }}
                    hitSlop={6}
                    style={styles.starTouch}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={24}
                      color="#F4C464"
                    />
                  </Pressable>
                ))}
                <Text style={styles.ratingNumberText}>{rating}.0 / 5.0</Text>
              </View>
            </View>

            {/* Sizing Fit Tag */}
            <View style={styles.sizingRow}>
              <Text style={styles.fieldLabel}>Fit & Sizing:</Text>
              <View style={styles.sizingPillsRow}>
                {(['True to Size', 'Runs Small', 'Runs Large'] as const).map((fit) => (
                  <Pressable
                    key={fit}
                    onPress={() => {
                      vibeHaptics.light();
                      setSizingVerdict(fit);
                    }}
                    style={[
                      styles.sizingPill,
                      sizingVerdict === fit && styles.sizingPillActive,
                    ]}>
                    <Text
                      style={[
                        styles.sizingPillText,
                        sizingVerdict === fit && styles.sizingPillTextActive,
                      ]}>
                      {fit}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Headline (if article mode) */}
            {reviewType === 'article' && (
              <View style={styles.inputBlock}>
                <Text style={styles.fieldLabel}>Article Headline:</Text>
                <TextInput
                  value={headline}
                  onChangeText={setHeadline}
                  placeholder="e.g. 3 Reasons Why This Drop Replaces My Daily Sneakers"
                  placeholderTextColor={palette.ink.onDarkMuted}
                  style={styles.headlineInput}
                />
              </View>
            )}

            {/* Review Thoughts / Body Text */}
            <View style={styles.inputBlock}>
              <Text style={styles.fieldLabel}>
                {reviewType === 'article' ? 'In-Depth Article Body:' : 'Tweet Verdict & Thoughts:'}
              </Text>
              <TextInput
                value={bodyText}
                onChangeText={setBodyText}
                placeholder={
                  reviewType === 'article'
                    ? 'Break down the material quality, styling tips, comfort after a week of wear, and whether you recommend it to fellow buyers...'
                    : 'Share your quick review, styling vibe, and quality score (e.g. 10/10 leather finish, fits true to size)...'
                }
                placeholderTextColor={palette.ink.onDarkMuted}
                multiline
                numberOfLines={reviewType === 'article' ? 6 : 4}
                style={[
                  styles.bodyInput,
                  reviewType === 'article' && { height: 120 },
                ]}
              />
            </View>

            {/* Video & Photo Media Attachment Row */}
            <View style={styles.mediaAttachmentBlock}>
              <Text style={styles.fieldLabel}>Attach Video Try-On or Photos:</Text>
              <View style={styles.mediaButtonsRow}>
                {/* Video Review Button */}
                <Pressable
                  onPress={handleToggleVideo}
                  style={[
                    styles.mediaActionBtn,
                    hasVideoAttached && styles.mediaActionBtnActive,
                  ]}>
                  <Ionicons
                    name={hasVideoAttached ? 'videocam' : 'videocam-outline'}
                    size={16}
                    color={hasVideoAttached ? palette.brand.orange : palette.ink.onDarkStrong}
                  />
                  <Text
                    style={[
                      styles.mediaActionText,
                      hasVideoAttached && styles.mediaActionTextActive,
                    ]}>
                    {hasVideoAttached ? 'Video Try-On Attached ✓' : '+ Attach Video Review'}
                  </Text>
                </Pressable>

                {/* Photos Button */}
                <Pressable onPress={handlePickPhotos} style={styles.mediaActionBtn}>
                  <Ionicons name="images-outline" size={16} color={palette.ink.onDarkStrong} />
                  <Text style={styles.mediaActionText}>
                    {attachedMedia.length ? `${attachedMedia.length} Photos` : '+ Add Photos'}
                  </Text>
                </Pressable>
              </View>

              {/* Photo Previews */}
              {attachedMedia.length > 0 && (
                <View style={styles.thumbnailsRow}>
                  {attachedMedia.map((img, idx) => (
                    <View key={idx} style={styles.thumbWrap}>
                      <Image source={{ uri: img.uri }} style={styles.thumbImage} contentFit="cover" />
                      <Pressable
                        onPress={() => setAttachedMedia(attachedMedia.filter((_, i) => i !== idx))}
                        style={styles.thumbRemove}>
                        <Ionicons name="close" size={10} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Publish Action Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.publishBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}>
              <LinearGradient
                colors={['#D89544', '#A6692E']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  <Text style={styles.publishBtnText}>Publish Verified Review Drop</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#16110E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  handleBarWrap: {
    alignItems: 'center',
    paddingTop: spacing['3'],
    paddingBottom: spacing['2'],
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
    fontWeight: '800',
  },
  sheetSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing['4'],
    gap: spacing['3'],
  },
  productAnchorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(47, 107, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.22)',
  },
  productThumbWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#2A1C14',
  },
  productThumb: {
    width: '100%',
    height: '100%',
  },
  taggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  taggedBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    color: palette.brand.orange,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  anchorTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  anchorPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
  },
  verifiedCheck: {
    paddingLeft: spacing['2'],
  },
  formatSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: radius.md,
    padding: 3,
  },
  formatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  formatBtnActive: {
    backgroundColor: 'rgba(47, 107, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.3)',
  },
  formatBtnText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  formatBtnTextActive: {
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  fieldLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starTouch: {
    padding: 2,
  },
  ratingNumberText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#F4C464',
    fontWeight: '700',
    marginLeft: spacing['2'],
  },
  sizingRow: {
    gap: 6,
  },
  sizingPillsRow: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  sizingPill: {
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sizingPillActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.14)',
    borderColor: '#4ADE80',
  },
  sizingPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  sizingPillTextActive: {
    color: '#4ADE80',
    fontWeight: '700',
  },
  inputBlock: {
    gap: 4,
  },
  headlineInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    paddingHorizontal: spacing['3'],
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    fontWeight: '700',
  },
  bodyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    paddingHorizontal: spacing['3'],
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    textAlignVertical: 'top',
    height: 80,
  },
  mediaAttachmentBlock: {
    gap: 6,
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  mediaActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaActionBtnActive: {
    backgroundColor: 'rgba(47, 107, 255, 0.14)',
    borderColor: palette.brand.orange,
  },
  mediaActionText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkStrong,
    fontWeight: '600',
  },
  mediaActionTextActive: {
    color: palette.brand.orange,
    fontWeight: '700',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['1'],
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtn: {
    height: 48,
    borderRadius: radius.pill,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  publishBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
