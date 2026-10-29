import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { DopamineCelebrationModal } from '@/components/ui/DopamineCelebrationModal';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useCreateProduct } from '@/src/api/products/hooks';
import { useUser } from '@/src/store/user';
import { useIsAuthed } from '@/src/store/auth';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { vibeHaptics } from '@/src/lib/haptics';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatNaira, nairaToKobo } from '@/src/utils/money';
import { assetUploadErrorMessage, uploadLocalAssets } from '@/src/utils/upload-media';

const MAX_IMAGES = 6;

type DropFormat = 'carousel' | 'reel' | 'drop';

const FORMATS: { key: DropFormat; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  {
    key: 'carousel',
    label: 'Lookbook Carousel',
    icon: 'images-outline',
    desc: 'Swipeable storytelling cards & zoomable angles',
  },
  {
    key: 'reel',
    label: 'Shoppable Reel',
    icon: 'play-circle-outline',
    desc: '9:16 vertical video with tagged product overlay',
  },
  {
    key: 'drop',
    label: 'Signature Drop',
    icon: 'flash-outline',
    desc: 'Limited release countdown & single hero card',
  },
];

const CATEGORY_PRESETS = [
  'Streetwear',
  'Footwear',
  'Luxury',
  'Vintage',
  'Handmade',
  'Accessories',
  'Art & Collectibles',
];

const SPLIT_OPTIONS = [10, 15, 20, 25, 30, 50];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];

export default function CreatorProductStudioScreen() {
  const role = useUser((s) => s.role);
  const authed = useIsAuthed();

  // Stepper: 1: Format & Media, 2: Story & Price, 3: Collab & Split, 4: Launch & Privacy
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Format & Media
  const [format, setFormat] = useState<DropFormat>('carousel');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Step 2: Story & Pricing
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Streetwear');
  const [salePrice, setSalePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);

  // Step 3: Creator Collaboration & Splits
  const [isCollab, setIsCollab] = useState(false);
  const [collaboratorHandle, setCollaboratorHandle] = useState('');
  const [collabSplitPercent, setCollabSplitPercent] = useState<number>(15);

  // Step 4: Fulfillment & Privacy
  const [stock, setStock] = useState('10');
  const [isMadeToOrder, setIsMadeToOrder] = useState(false);
  const [maskLocation, setMaskLocation] = useState(true);
  const [allowAnonymousGifting, setAllowAnonymousGifting] = useState(true);

  // UI state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const createProduct = useCreateProduct();
  const { pick, pickMany } = useImagePicker();

  const numericPrice = Number(salePrice.replace(/[^0-9]/g, '')) || 0;

  // Earnings calculations
  const collabCut = useMemo(() => {
    if (!isCollab || numericPrice <= 0) return 0;
    return Math.round((numericPrice * collabSplitPercent) / 100);
  }, [isCollab, numericPrice, collabSplitPercent]);

  const vendorCut = numericPrice - collabCut;

  const canProceedStep1 = images.length > 0;
  const canProceedStep2 = name.trim().length > 0 && category.trim().length > 0 && numericPrice > 0;
  const canSave = canProceedStep1 && canProceedStep2;

  const fromCamera = async () => {
    const img = await pick('camera');
    if (img) setImages((arr) => [...arr, img].slice(0, MAX_IMAGES));
  };

  const fromGallery = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const picked = await pickMany(remaining);
    if (picked.length) setImages((arr) => [...arr, ...picked].slice(0, MAX_IMAGES));
  };

  const removeAt = (idx: number) => {
    vibeHaptics.light();
    setImages((arr) => arr.filter((_, i) => i !== idx));
  };

  const toggleSize = (size: string) => {
    vibeHaptics.selection();
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleNextStep = () => {
    vibeHaptics.selection();
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const handlePrevStep = () => {
    vibeHaptics.selection();
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handlePublish = async () => {
    if (!canSave || isUploading || createProduct.isPending) return;
    setError(null);
    vibeHaptics.heavy();
    setUploading(true);

    let mediaIds: string[] = [];
    try {
      const uploaded = await uploadLocalAssets(images, 'product');
      mediaIds = uploaded.map((asset) => asset.mediaId);
    } catch (err) {
      setError(assetUploadErrorMessage(err));
      setUploading(false);
      return;
    }

    try {
      await createProduct.mutateAsync({
        title: name.trim(),
        description: desc.trim(),
        price: nairaToKobo(numericPrice),
        category: category.trim(),
        stock: isMadeToOrder ? 999 : Number(stock) || 1,
        mediaIds,
        active: true,
        variants: {
          sizes: selectedSizes,
        },
        format,
        collaboratorHandle: isCollab && collaboratorHandle.trim() ? collaboratorHandle.trim() : undefined,
        collaboratorSplitPercent: isCollab ? collabSplitPercent : undefined,
        maskLocation,
        allowAnonymousGifting,
      });

      vibeHaptics.dopamineBurst();
      setCelebrationOpen(true);
    } catch {
      setError('Could not publish product drop.');
    } finally {
      setUploading(false);
    }
  };

  if (!authed) {
    return (
      <ScreenContainer variant="espresso">
        <TopBar title="Sign In Required" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255, 159, 10, 0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Ionicons name="lock-closed" size={38} color={palette.brand.orange} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: palette.ink.onDarkStrong, textAlign: 'center', marginBottom: 8 }}>
            Sign-In Required
          </Text>
          <Text style={{ fontSize: 14, color: palette.ink.onDarkMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            You need to be signed in to your vendor account to upload and publish products.
          </Text>
          <PrimaryButton label="Sign In" onPress={() => router.push('/login')} style={{ width: '100%' }} />
        </View>
      </ScreenContainer>
    );
  }

  if (role !== 'vendor') {
    return (
      <ScreenContainer variant="espresso">
        <TopBar title="Product Studio" showBack />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255, 159, 10, 0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Ionicons name="storefront" size={40} color={palette.brand.orange} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: palette.ink.onDarkStrong, textAlign: 'center', marginBottom: 8 }}>
            Vendor Account Required
          </Text>
          <Text style={{ fontSize: 14, color: palette.ink.onDarkMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            Only verified vendors can upload and list products in the marketplace. Buyers can share community posts, stories, and reviews.
          </Text>
          <PrimaryButton label="Go back" onPress={() => router.back()} style={{ width: '100%' }} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer variant="espresso">
      {/* Top Bar with Live Mobile Preview Toggle */}
      <TopBar
        title="Creator Studio"
        showBack
        rightAction={
          <Pressable
            onPress={() => {
              vibeHaptics.selection();
              setPreviewOpen(true);
            }}
            style={styles.previewBtn}
            hitSlop={8}>
            <Ionicons name="eye-outline" size={14} color="#D89544" />
            <Text style={styles.previewBtnText}>Live Preview</Text>
          </Pressable>
        }
      />

      {/* Refero.design Progressive Stepper Indicator */}
      <View style={styles.stepperWrap}>
        <View style={styles.stepsRow}>
          {[
            { num: 1, label: 'Media' },
            { num: 2, label: 'Story' },
            { num: 3, label: 'Collab' },
            { num: 4, label: 'Launch' },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <Pressable
                key={s.num}
                onPress={() => {
                  vibeHaptics.selection();
                  setCurrentStep(s.num as 1 | 2 | 3 | 4);
                }}
                style={styles.stepTab}>
                <View
                  style={[
                    styles.stepBadge,
                    isActive && styles.stepBadgeActive,
                    isCompleted && styles.stepBadgeDone,
                  ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepBadgeText,
                        (isActive || isCompleted) && styles.stepBadgeTextActive,
                      ]}>
                      {s.num}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isCompleted && styles.stepLabelDone,
                  ]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* STEP 1: FORMAT & MEDIA CANVAS */}
        {currentStep === 1 && (
          <View style={styles.stepPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.paneTitle}>Choose Drop Format</Text>
              <Text style={styles.paneSubtitle}>
                Tell your creative story with swipeable lookbooks or shoppable reels.
              </Text>
            </View>

            {/* DesignSpells format picker with tactile spring touch */}
            <View style={styles.formatGrid}>
              {FORMATS.map((fmt) => {
                const isSelected = format === fmt.key;
                return (
                  <Pressable
                    key={fmt.key}
                    onPress={() => {
                      vibeHaptics.selection();
                      setFormat(fmt.key);
                    }}
                    style={({ pressed }) => [
                      styles.formatCard,
                      isSelected && styles.formatCardSelected,
                      pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                    ]}>
                    <View style={[styles.formatIconWrap, isSelected && styles.formatIconWrapActive]}>
                      <Ionicons
                        name={fmt.icon}
                        size={20}
                        color={isSelected ? '#FFFFFF' : palette.brand.orange}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.formatLabel, isSelected && styles.formatLabelActive]}>
                        {fmt.label}
                      </Text>
                      <Text style={styles.formatDesc}>{fmt.desc}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={palette.brand.orange} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Media Canvas with Lookbook Slide Tags */}
            <View style={styles.sectionHeader}>
              <Text style={styles.paneTitle}>Media Canvas</Text>
              <Text style={styles.paneSubtitle}>
                Upload up to {MAX_IMAGES} lookbook images. Slide 1 will be your hero cover.
              </Text>
            </View>

            {images.length === 0 ? (
              <Pressable
                onPress={() => setSheetOpen(true)}
                style={({ pressed }) => [styles.uploadEmptyCard, pressed && { opacity: 0.85 }]}>
                <View style={styles.uploadEmptyIcon}>
                  <Ionicons name="images" size={32} color="#D89544" />
                </View>
                <Text style={styles.uploadEmptyTitle}>Add Lookbook Media</Text>
                <Text style={styles.uploadEmptySub}>Tap to capture camera shot or pick gallery photos</Text>
              </Pressable>
            ) : (
              <View style={styles.mediaCanvas}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
                  {images.map((img, i) => (
                    <View key={img.uri + i} style={styles.slideCard}>
                      <Image source={{ uri: img.uri }} style={styles.slideThumb} contentFit="cover" />
                      <View style={styles.slideBadge}>
                        <Text style={styles.slideBadgeText}>
                          {i === 0 ? 'Cover Hero' : `Slide ${i + 1}`}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeAt(i)} hitSlop={8} style={styles.slideDelete}>
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}

                  {images.length < MAX_IMAGES && (
                    <Pressable
                      onPress={() => setSheetOpen(true)}
                      style={({ pressed }) => [styles.addMoreCard, pressed && { opacity: 0.85 }]}>
                      <Ionicons name="add" size={28} color={palette.brand.orange} />
                      <Text style={styles.addMoreText}>Add Slide</Text>
                    </Pressable>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: STORY & PRICING */}
        {currentStep === 2 && (
          <View style={styles.stepPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.paneTitle}>Product Essentials</Text>
              <Text style={styles.paneSubtitle}>Define the title, aesthetic tags, and pricing.</Text>
            </View>

            <TextField
              placeholder="Product Name (e.g. Vintage Heavyweight Boxy Tee)"
              value={name}
              onChangeText={setName}
            />

            {/* Category Presets */}
            <View style={styles.tagWrap}>
              <Text style={styles.inputGroupLabel}>Category Vibe</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScroll}>
                {CATEGORY_PRESETS.map((cat) => {
                  const isSel = category === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => {
                        vibeHaptics.selection();
                        setCategory(cat);
                      }}
                      style={[styles.tagPill, isSel && styles.tagPillActive]}>
                      <Text style={[styles.tagPillText, isSel && styles.tagPillTextActive]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <TextField
              placeholder="Creator Story & Fabric Description"
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={3}
              style={{ minHeight: 88 }}
            />

            {/* Pricing Fields */}
            <View style={styles.priceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputGroupLabel}>Sale Price (₦)</Text>
                <TextField
                  placeholder="e.g. 50,000"
                  value={salePrice}
                  onChangeText={setSalePrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputGroupLabel}>Discount / Early-Bird (₦)</Text>
                <TextField
                  placeholder="Optional"
                  value={discountPrice}
                  onChangeText={setDiscountPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Variant Sizes */}
            <View style={{ marginTop: spacing['2'] }}>
              <Text style={styles.inputGroupLabel}>Available Sizes</Text>
              <View style={styles.sizePillRow}>
                {SIZES.map((sz) => {
                  const isSel = selectedSizes.includes(sz);
                  return (
                    <Pressable
                      key={sz}
                      onPress={() => toggleSize(sz)}
                      style={[styles.sizePill, isSel && styles.sizePillActive]}>
                      <Text style={[styles.sizePillText, isSel && styles.sizePillTextActive]}>{sz}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: CREATOR COLLABORATION & SPLITS */}
        {currentStep === 3 && (
          <View style={styles.stepPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.paneTitle}>Creator Collaboration</Text>
              <Text style={styles.paneSubtitle}>
                Co-create this drop with an influencer, model, or designer. Automated revenue splits!
              </Text>
            </View>

            <View style={styles.collabCard}>
              <View style={styles.collabHeader}>
                <View style={styles.collabIconWrap}>
                  <Ionicons name="people-outline" size={22} color={palette.brand.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.collabTitle}>Co-Create Drop</Text>
                  <Text style={styles.collabSubtitle}>
                    Featured on both feeds with automated revenue splits per order
                  </Text>
                </View>
                <Switch
                  value={isCollab}
                  onValueChange={(val) => {
                    vibeHaptics.selection();
                    setIsCollab(val);
                  }}
                  trackColor={{ false: '#1A2244', true: palette.brand.orange }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {isCollab ? (
                <View style={styles.collabExpanded}>
                  <TextField
                    placeholder="Co-Creator Handle (e.g. @amaka_style)"
                    value={collaboratorHandle}
                    onChangeText={setCollaboratorHandle}
                    autoCapitalize="none"
                  />

                  {/* Revenue Split Dial */}
                  <View style={{ marginTop: spacing['2'] }}>
                    <Text style={styles.inputGroupLabel}>Collaborator Revenue Cut</Text>
                    <View style={styles.splitPillRow}>
                      {SPLIT_OPTIONS.map((pct) => {
                        const isSel = collabSplitPercent === pct;
                        return (
                          <Pressable
                            key={pct}
                            onPress={() => {
                              vibeHaptics.selection();
                              setCollabSplitPercent(pct);
                            }}
                            style={[styles.splitPill, isSel && styles.splitPillActive]}>
                            <Text style={[styles.splitPillText, isSel && styles.splitPillTextActive]}>
                              {pct}%
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Dynamic Earnings Breakdown Card */}
                  <View style={styles.earningsBreakdown}>
                    <View style={styles.earningsRow}>
                      <Text style={styles.earningsLabel}>Your Store Earnings:</Text>
                      <Text style={styles.earningsValue}>
                        {formatNaira(vendorCut)} ({100 - collabSplitPercent}%)
                      </Text>
                    </View>
                    <View style={styles.earningsRow}>
                      <Text style={styles.earningsLabel}>
                        {collaboratorHandle.trim() || 'Co-Creator'} Cut:
                      </Text>
                      <Text style={[styles.earningsValue, { color: '#4ADE80' }]}>
                        {formatNaira(collabCut)} ({collabSplitPercent}%)
                      </Text>
                    </View>
                    <Text style={styles.earningsHint}>
                      ✨ Payouts deposit automatically into respective eWallets when buyers confirm receipt.
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* STEP 4: LAUNCH, FULFILLMENT & PRIVACY */}
        {currentStep === 4 && (
          <View style={styles.stepPane}>
            <View style={styles.sectionHeader}>
              <Text style={styles.paneTitle}>Fulfillment & Privacy</Text>
              <Text style={styles.paneSubtitle}>
                Control stock availability and protect your physical studio address.
              </Text>
            </View>

            {/* Inventory */}
            <View style={styles.inventoryCard}>
              <View style={styles.inventoryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inventoryTitle}>Made-to-Order / Unlimited</Text>
                  <Text style={styles.inventorySubtitle}>Craft on demand without stock limits</Text>
                </View>
                <Switch
                  value={isMadeToOrder}
                  onValueChange={(val) => {
                    vibeHaptics.selection();
                    setIsMadeToOrder(val);
                  }}
                  trackColor={{ false: '#1A2244', true: palette.brand.orange }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {!isMadeToOrder && (
                <View style={{ marginTop: spacing['3'] }}>
                  <Text style={styles.inputGroupLabel}>Initial Stock Quantity</Text>
                  <TextField
                    placeholder="e.g. 10"
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {/* Location Masking Toggle */}
            <View style={styles.privacyCard}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-half-sharp" size={16} color="#D89544" />
                  <Text style={styles.privacyTitle}>Mask Exact Workshop Pin</Text>
                </View>
                <Text style={styles.privacySubtitle}>
                  Public explore map shows your neighborhood perimeter (e.g. Lekki Phase 1), keeping your private studio door hidden.
                </Text>
              </View>
              <Switch
                value={maskLocation}
                onValueChange={(val) => {
                  vibeHaptics.selection();
                  setMaskLocation(val);
                }}
                trackColor={{ false: '#1A2244', true: palette.brand.orange }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Anonymous Gifting Enabled */}
            <View style={styles.privacyCard}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="gift-outline" size={16} color="#4ADE80" />
                  <Text style={styles.privacyTitle}>Allow Anonymous Gifting</Text>
                </View>
                <Text style={styles.privacySubtitle}>
                  Buyers can buy this drop as a secret surprise gift for friends with Zero-Knowledge address escrow.
                </Text>
              </View>
              <Switch
                value={allowAnonymousGifting}
                onValueChange={(val) => {
                  vibeHaptics.selection();
                  setAllowAnonymousGifting(val);
                }}
                trackColor={{ false: '#1A2244', true: '#4ADE80' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}
      </ScrollView>

      {/* Bottom Step Navigation Bar */}
      <View style={styles.bottomNav}>
        {currentStep > 1 && (
          <Pressable onPress={handlePrevStep} style={styles.prevBtn}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={styles.prevBtnText}>Back</Text>
          </Pressable>
        )}

        <View style={{ flex: 1 }}>
          {currentStep < 4 ? (
            <PrimaryButton
              label={`Continue to ${currentStep === 1 ? 'Story' : currentStep === 2 ? 'Collabs' : 'Launch'}`}
              onPress={handleNextStep}
              disabled={currentStep === 1 ? !canProceedStep1 : currentStep === 2 ? !canProceedStep2 : false}
            />
          ) : (
            <PrimaryButton
              label={isUploading || createProduct.isPending ? 'Publishing Drop…' : '🚀 Launch Drop Now'}
              onPress={handlePublish}
              disabled={!canSave || isUploading || createProduct.isPending}
              loading={isUploading || createProduct.isPending}
            />
          )}
        </View>
      </View>

      {/* Refero.design Interactive Live Mobile Preview Modal */}
      <Modal visible={previewOpen} transparent animationType="slide" onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.previewBackdrop}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewBadge}>
                <Ionicons name="sparkles" size={12} color="#D89544" />
                <Text style={styles.previewBadgeText}>BUYER FEED LIVE PREVIEW</Text>
              </View>
              <Pressable onPress={() => setPreviewOpen(false)} style={styles.previewClose} hitSlop={8}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Mobile Card Mockup */}
            <View style={styles.mockupFeedCard}>
              {/* Creator Attribution */}
              <View style={styles.mockupAuthorRow}>
                <View style={styles.mockupAvatar}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>YOU</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mockupAuthorName}>Your Store</Text>
                  {isCollab && collaboratorHandle ? (
                    <Text style={styles.mockupCollabSubtitle}>
                      with <Text style={{ color: palette.brand.orange }}>{collaboratorHandle}</Text>
                    </Text>
                  ) : null}
                </View>
                <View style={styles.mockupFormatPill}>
                  <Text style={styles.mockupFormatText}>
                    {format === 'carousel' ? 'Lookbook' : format === 'reel' ? 'Reel' : 'Drop'}
                  </Text>
                </View>
              </View>

              {/* Lookbook Media Preview */}
              <View style={styles.mockupMediaWrap}>
                {images[activeSlideIdx] ? (
                  <Image source={{ uri: images[activeSlideIdx].uri }} style={styles.mockupMedia} contentFit="cover" />
                ) : (
                  <View style={styles.mockupEmptyMedia}>
                    <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.3)" />
                  </View>
                )}

                {/* Carousel Dots */}
                {images.length > 1 && (
                  <View style={styles.mockupDotsRow}>
                    {images.map((_, dotIdx) => (
                      <Pressable
                        key={dotIdx}
                        onPress={() => setActiveSlideIdx(dotIdx)}
                        style={[
                          styles.mockupDot,
                          activeSlideIdx === dotIdx && styles.mockupDotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Title & Price Row */}
              <View style={styles.mockupMeta}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mockupTitle}>{name || 'Drop Title Preview'}</Text>
                  <Text style={styles.mockupCategory}>{category}</Text>
                </View>
                <Text style={styles.mockupPrice}>
                  {numericPrice > 0 ? formatNaira(numericPrice) : '₦0'}
                </Text>
              </View>

              <View style={styles.mockupActions}>
                <View style={styles.mockupBuyBtn}>
                  <Text style={styles.mockupBuyBtnText}>Shop Drop</Text>
                </View>
                {allowAnonymousGifting && (
                  <View style={styles.mockupGiftBtn}>
                    <Ionicons name="gift-outline" size={14} color="#FBBF24" />
                    <Text style={styles.mockupGiftBtnText}>Gift</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload Sheet */}
      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={fromCamera}
        onGallery={fromGallery}
        title="Add Lookbook Slide"
      />

      {/* Dopamine Particle Celebration Modal on Launch */}
      <DopamineCelebrationModal
        visible={celebrationOpen}
        onClose={() => {
          setCelebrationOpen(false);
          router.replace('/products/saved');
        }}
        details={{
          title: 'Drop Published! 🚀',
          subtitle: `Your ${format === 'carousel' ? 'Lookbook Carousel' : format === 'reel' ? 'Shoppable Reel' : 'Signature Drop'} is live in Market!`,
          badge: isCollab ? `Co-created with ${collaboratorHandle}` : undefined,
          isEscrowPrivate: maskLocation,
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
  },
  previewBtnText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#D89544',
  },
  stepperWrap: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing['2'],
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: palette.brand.orange,
  },
  stepBadgeDone: {
    backgroundColor: '#4ADE80',
  },
  stepBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    fontWeight: '700',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  stepLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepLabelDone: {
    color: '#4ADE80',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.brand.orange,
  },
  scroll: {
    paddingHorizontal: spacing['4'],
    paddingBottom: 100,
  },
  stepPane: {
    gap: spacing['3'],
    paddingTop: spacing['2'],
  },
  sectionHeader: {
    marginBottom: spacing['1'],
  },
  paneTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paneSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  formatGrid: {
    gap: spacing['2'],
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1C1613',
    padding: spacing['3'],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formatCardSelected: {
    borderColor: palette.brand.orange,
    backgroundColor: '#261C15',
  },
  formatIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatIconWrapActive: {
    backgroundColor: palette.brand.orange,
  },
  formatLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkMuted,
  },
  formatLabelActive: {
    color: '#FFFFFF',
  },
  formatDesc: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  uploadEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(47, 107, 255, 0.35)',
    borderRadius: radius.lg,
    paddingVertical: spacing['6'],
    gap: 6,
  },
  uploadEmptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadEmptyTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: '#FFFFFF',
  },
  uploadEmptySub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  mediaCanvas: {
    marginTop: spacing['1'],
  },
  thumbsRow: {
    gap: 10,
    paddingVertical: spacing['1'],
  },
  slideCard: {
    width: 120,
    height: 160,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#2A1F18',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  slideThumb: {
    width: '100%',
    height: '100%',
  },
  slideBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  slideBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slideDelete: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreCard: {
    width: 120,
    height: 160,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(47, 107, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    gap: 6,
  },
  addMoreText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
    fontWeight: '600',
  },
  inputGroupLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    marginBottom: 6,
    fontWeight: '600',
  },
  tagWrap: {
    marginVertical: spacing['1'],
  },
  tagScroll: {
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#1F1915',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagPillActive: {
    borderColor: palette.brand.orange,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
  },
  tagPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  tagPillTextActive: {
    color: palette.brand.orange,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sizePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizePill: {
    width: 48,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: '#1F1915',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sizePillActive: {
    borderColor: palette.brand.orange,
    backgroundColor: 'rgba(47, 107, 255, 0.2)',
  },
  sizePillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  sizePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  collabCard: {
    backgroundColor: '#1C1613',
    borderRadius: radius.lg,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.25)',
  },
  collabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collabTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: '#FFFFFF',
  },
  collabSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  collabExpanded: {
    marginTop: spacing['3'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing['2'],
  },
  splitPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  splitPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#261D17',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  splitPillActive: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  splitPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    fontWeight: '600',
  },
  splitPillTextActive: {
    color: '#4ADE80',
    fontWeight: '700',
  },
  earningsBreakdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: radius.md,
    padding: spacing['3'],
    marginTop: spacing['2'],
    gap: 6,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  earningsValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  earningsHint: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
    marginTop: 4,
  },
  inventoryCard: {
    backgroundColor: '#1C1613',
    borderRadius: radius.md,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inventoryTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  inventorySubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1613',
    borderRadius: radius.md,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  privacyTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  privacySubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  errorText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.status.danger,
    textAlign: 'center',
    marginTop: 6,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    backgroundColor: '#120C08',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  previewCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#16110E',
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3'],
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  previewBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: '#D89544',
  },
  previewClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupFeedCard: {
    backgroundColor: '#201814',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mockupAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing['3'],
  },
  mockupAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupAuthorName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  mockupCollabSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  mockupFormatPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  mockupFormatText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkSoft,
  },
  mockupMediaWrap: {
    width: '100%',
    height: 220,
    backgroundColor: '#0D0A08',
  },
  mockupMedia: {
    width: '100%',
    height: '100%',
  },
  mockupEmptyMedia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupDotsRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  mockupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mockupDotActive: {
    backgroundColor: palette.brand.orange,
    width: 14,
  },
  mockupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['3'],
  },
  mockupTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  mockupCategory: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.brand.orange,
    marginTop: 2,
  },
  mockupPrice: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
  },
  mockupActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing['3'],
    paddingBottom: spacing['3'],
  },
  mockupBuyBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupBuyBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mockupGiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  mockupGiftBtnText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
  },
});
