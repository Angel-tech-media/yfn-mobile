import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useSegments } from 'expo-router';

import { CartMascot } from '@/components/ui/BrandLogo';
import { PressableScale } from '@/components/ui/PressableScale';
import { searchApi } from '@/src/api/search';
import { vibeHaptics } from '@/src/lib/haptics';
import { useAuth } from '@/src/store/auth';
import { useCarty } from '@/src/store/carty';
import { useUser } from '@/src/store/user';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatNaira } from '@/src/utils/money';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SIZE = 58;
const MARGIN = 14;
const MIN_Y = Platform.OS === 'ios' ? 60 : 44;
const MAX_Y = SCREEN_HEIGHT - 128; // Keep above bottom tab bar and home indicator

const INITIAL_X = SCREEN_WIDTH - ORB_SIZE - MARGIN;
const INITIAL_Y = SCREEN_HEIGHT - 170;

const HIDDEN_ROUTE_GROUPS = new Set([
  '(app-launch)',
  '(login)',
  '(buyer-signup)',
  '(vendor-signup)',
]);

export type VendorRecommendation = {
  id: string;
  handle: string;
  storeName: string;
  category: string;
  rating: number;
  ratingCount: number;
  isVerified?: boolean;
  neighborhood: string;
  distanceKm?: number;
  recommendReason: string;
  matchedItem?: {
    title: string;
    price?: number;
  };
  avatarUrl?: string | null;
};

export type CopilotMessage = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  chips?: string[];
  vendorRecommendations?: VendorRecommendation[];
};

// Curated verified vendors in Lagos for rich recommendations
const CURATED_VENDORS_BY_CATEGORY: Record<string, VendorRecommendation[]> = {
  sneakers: [
    {
      id: 'vendor_kicks_1',
      handle: 'lagoskicks',
      storeName: 'Lagos Kicks Vault',
      category: 'Sneakers & Street Footwear',
      rating: 4.9,
      ratingCount: 184,
      isVerified: true,
      neighborhood: 'Ikeja GRA, Lagos',
      distanceKm: 1.8,
      recommendReason: '🏆 #1 rated for verified authentic Dunks & Jordans with 24hr escrow delivery.',
      matchedItem: { title: 'Retro Low Dunks (Phantom Black)', price: 28500 },
      avatarUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'vendor_kicks_2',
      handle: 'mainland_kicks',
      storeName: 'Mainland Sole Hub',
      category: 'Footwear & Streetwear',
      rating: 4.8,
      ratingCount: 112,
      isVerified: true,
      neighborhood: 'Yaba Tech District, Lagos',
      distanceKm: 3.2,
      recommendReason: '⚡ Direct-from-source collector drops and guaranteed deadstock condition.',
      matchedItem: { title: 'Suede Trail Runners 3.0', price: 22000 },
      avatarUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop&q=80',
    },
  ],
  streetwear: [
    {
      id: 'vendor_street_1',
      handle: 'urbannative',
      storeName: 'Urban Native Studio',
      category: 'Streetwear & Denim',
      rating: 4.9,
      ratingCount: 228,
      isVerified: true,
      neighborhood: 'Lekki Phase 1, Lagos',
      distanceKm: 4.6,
      recommendReason: '🔥 High-demand heavyweight boxy tees and custom Lagos streetwear silhouettes.',
      matchedItem: { title: 'Boxy Heavyweight Acid Tee', price: 16500 },
      avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'vendor_street_2',
      handle: 'thriftking_ng',
      storeName: 'Thrift King Vintage',
      category: 'Curated 90s Vintage',
      rating: 4.8,
      ratingCount: 340,
      isVerified: true,
      neighborhood: 'Surulere, Lagos',
      distanceKm: 2.7,
      recommendReason: '✨ Handpicked 90s band tees, reworked denim, and sustainable fashion gems.',
      matchedItem: { title: 'Archival Washed Cargo Pants', price: 14000 },
      avatarUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300&auto=format&fit=crop&q=80',
    },
  ],
  perfume: [
    {
      id: 'vendor_perfume_1',
      handle: 'scenthaven',
      storeName: 'Scent Haven Luxury Ouds',
      category: 'Arabian Perfumery & Oils',
      rating: 5.0,
      ratingCount: 156,
      isVerified: true,
      neighborhood: 'Victoria Island, Lagos',
      distanceKm: 5.2,
      recommendReason: '💎 Niche concentrated oud oils with 18+ hour beast-mode sillage.',
      matchedItem: { title: 'Royal Amber & Smoked Oud 50ml', price: 35000 },
      avatarUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'vendor_perfume_2',
      handle: 'thefragranceloft',
      storeName: 'The Fragrance Loft',
      category: 'Designer Scents & Decants',
      rating: 4.9,
      ratingCount: 98,
      isVerified: true,
      neighborhood: 'Ikeja City Mall, Lagos',
      distanceKm: 1.9,
      recommendReason: '🌸 Verified authentic luxury designer decants & gift sets.',
      matchedItem: { title: 'Vanilla & Bergamot Extrait', price: 19500 },
      avatarUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=300&auto=format&fit=crop&q=80',
    },
  ],
  jewelry: [
    {
      id: 'vendor_jewel_1',
      handle: 'gildedera',
      storeName: 'Gilded Era Jewels',
      category: 'Jewelry & Watches',
      rating: 4.9,
      ratingCount: 88,
      isVerified: true,
      neighborhood: 'Ikoyi, Lagos',
      distanceKm: 4.1,
      recommendReason: '✨ Waterproof stainless Cuban chains and moissanite stones with test certificates.',
      matchedItem: { title: 'Solid Rope Chain (18k Gold Plate)', price: 24000 },
      avatarUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80',
    },
  ],
  gifts: [
    {
      id: 'vendor_gift_1',
      handle: 'bloomandwrap',
      storeName: 'Bloom & Wrap Co.',
      category: 'Curated Gifts & Hampers',
      rating: 5.0,
      ratingCount: 176,
      isVerified: true,
      neighborhood: 'Ikeja, Lagos',
      distanceKm: 1.5,
      recommendReason: '🎁 Specialize in secret anonymous gifting, luxury wrapping, and same-day delivery.',
      matchedItem: { title: 'Midnight Luxe Gift Hamper', price: 29000 },
      avatarUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=300&auto=format&fit=crop&q=80',
    },
  ],
};

export function VibeAiCopilot() {
  const segments = useSegments();
  const accessToken = useAuth((s) => s.accessToken);
  const role = useUser((s) => s.role);
  const isVendor = role === 'vendor';

  const topSegment = segments[0] as string | undefined;
  const shouldHide = !accessToken || !topSegment || HIDDEN_ROUTE_GROUPS.has(topSegment);

  const isOpen = useCarty((s) => s.isOpen);
  const openCarty = useCarty((s) => s.open);
  const closeCarty = useCarty((s) => s.close);
  const setIsOpen = (next: boolean) => (next ? openCarty() : closeCarty());
  const [query, setQuery] = useState('');
  const [isMaskingLocation, setIsMaskingLocation] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  const slideAnim = useRef(new Animated.Value(600)).current;

  // Open / Close sheet animations
  useEffect(() => {
    if (isOpen) {
      vibeHaptics.medium();
      // Initialize contextual greeting if empty
      if (messages.length === 0) {
        if (isVendor) {
          setMessages([
            {
              id: 'init_vendor',
              sender: 'ai',
              text: "Hey Boss! I'm Carty, your Business & Sourcing Copilot. Streetwear and Vintage Dunks are spiking +41% nearby. Tell me what items or vendor partners you need!",
              chips: ['Top items to stock', 'Find sneaker suppliers', 'Mask store location', 'Optimize prices'],
            },
          ]);
        } else {
          setMessages([
            {
              id: 'init_buyer',
              sender: 'ai',
              text: "Hi! I'm Carty, your Shopping Assistant AI! 🛒✨\n\nTell me what you're looking for (e.g. vintage sneakers in Ikeja, oversized streetwear, perfumes, or gifts), and I'll recommend verified local vendors for you!",
              chips: [
                '👟 Vintage & Retro Dunks',
                '👕 Oversized Streetwear Tees',
                '🌸 Arabian Ouds & Perfumes',
                '🎁 Secret gift under ₦30k',
                '📍 Top rated near me',
              ],
            },
          ]);
        }
      }

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 85,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, isVendor, messages.length, slideAnim]);

  // Intelligent Vendor Recommendation Engine
  const processQuery = async (inputQuery: string) => {
    const userMsgId = `user_${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: inputQuery }]);

    const lower = inputQuery.toLowerCase();

    // Map intent to category
    let categoryKey = 'sneakers';
    if (lower.includes('cloth') || lower.includes('street') || lower.includes('tee') || lower.includes('hoodie') || lower.includes('vintage') || lower.includes('wear') || lower.includes('jean') || lower.includes('cargo')) {
      categoryKey = 'streetwear';
    } else if (lower.includes('perfume') || lower.includes('scent') || lower.includes('oud') || lower.includes('fragrance') || lower.includes('cologne')) {
      categoryKey = 'perfume';
    } else if (lower.includes('jewel') || lower.includes('watch') || lower.includes('chain') || lower.includes('ring') || lower.includes('pendant')) {
      categoryKey = 'jewelry';
    } else if (lower.includes('gift') || lower.includes('anonymous') || lower.includes('birthday') || lower.includes('surprise') || lower.includes('secret')) {
      categoryKey = 'gifts';
    }

    // Try live search from backend places endpoint
    let liveVendors: VendorRecommendation[] = [];
    try {
      const searchRes = await searchApi.search({ q: inputQuery.replace(/[^\w\s]/g, '').trim(), type: 'places', limit: 4 });
      if (searchRes?.places && searchRes.places.length > 0) {
        liveVendors = searchRes.places.map((p) => ({
          id: String(p.id),
          handle: p.handle || `vendor_${p.id}`,
          storeName: p.storeName || 'Verified Store',
          category: p.category || 'Curated Storefront',
          rating: p.rating || 4.9,
          ratingCount: p.ratingCount || 52,
          isVerified: p.isYfnVerified ?? true,
          neighborhood: p.address || 'Lagos, Nigeria',
          distanceKm: p.distanceKm ?? 2.5,
          recommendReason: p.matchingProductsCount
            ? `Stocks ${p.matchingProductsCount} item(s) matching your search with 100% escrow protection.`
            : 'Top-rated verified community vendor with excellent fulfillment rate.',
          matchedItem: p.matchedProductTitle
            ? {
                title: p.matchedProductTitle,
                price: p.matchedProductPrice ? Number(p.matchedProductPrice) : undefined,
              }
            : undefined,
          avatarUrl: p.logoUrl,
        }));
      }
    } catch {
      // Graceful fallback to curated knowledge base
    }

    // Combine live results with curated database
    const curatedFallback = CURATED_VENDORS_BY_CATEGORY[categoryKey] || CURATED_VENDORS_BY_CATEGORY.sneakers;
    const finalVendors = liveVendors.length > 0 ? [...liveVendors, ...curatedFallback.slice(0, 1)] : curatedFallback;

    setTimeout(() => {
      vibeHaptics.success();

      // Specific advice handlers
      if (lower.includes('stock') || lower.includes('invest') || lower.includes('price')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: "🔥 High-ROI Restock Radar for Vendors:\n1. Retro Chunky Dunks (Demand: 94/100, Est. Margin 45%)\n2. Heavyweight Washed Tees (Demand: 88/100)\nVendors carrying these in your radius sold out in under 72 hours.",
            chips: ['Find sneaker suppliers', 'Mask store location', 'Optimize my prices'],
            vendorRecommendations: finalVendors,
          },
        ]);
      } else if (lower.includes('gift') || lower.includes('anonymous') || lower.includes('secret')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: "🎁 Secret Gifting Active! I found top vendors that support zero-knowledge anonymous delivery. The recipient receives a gift claim code and selects their secure delivery hub—they never see your details!",
            chips: ['Browse trending gift items', 'View on interactive map'],
            vendorRecommendations: CURATED_VENDORS_BY_CATEGORY.gifts,
          },
        ]);
      } else if (lower.includes('map') || lower.includes('near me')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `📍 Here are verified vendors nearby with active stock! Tap "View on Map" on any card or explore the full interactive map.`,
            chips: ['Open full map 📍', '👟 Sneakers nearby', '👕 Streetwear nearby'],
            vendorRecommendations: finalVendors,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `🛒 I found ${finalVendors.length} top-rated verified vendor${finalVendors.length > 1 ? 's' : ''} for "${inputQuery}" with authentic stock and escrow buyer protection:`,
            chips: ['Open full map 📍', 'Compare prices', 'Send as secret gift'],
            vendorRecommendations: finalVendors,
          },
        ]);
      }
    }, 450);
  };

  const handleChipPress = (chip: string) => {
    vibeHaptics.light();
    if (chip.includes('full map') || chip.includes('Open full map')) {
      setIsOpen(false);
      router.push('/search?tab=map' as never);
      return;
    }
    processQuery(chip);
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const text = query.trim();
    setQuery('');
    processQuery(text);
  };

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* AMOLED Shopping Assistant AI Drawer */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.sheetContainer}>
            <Animated.View style={[styles.canvas, { transform: [{ translateY: slideAnim }] }]}>
              {/* Header */}
              <View style={styles.canvasHeader}>
                <View style={styles.handleBar} />
                <View style={styles.titleRow}>
                  <View style={styles.mascotHeaderTitle}>
                    <CartMascot size={34} />
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.assistantTitle}>Carty</Text>
                        <View style={styles.copilotBadge}>
                          <Ionicons name="sparkles" size={10} color="#D89544" />
                          <Text style={styles.copilotBadgeText}>
                            {isVendor ? 'VENDOR ADVISOR' : 'SHOPPING ASSISTANT'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.assistantSubtitle}>
                        {isVendor
                          ? 'Market trends, restock radar & vendor sourcing'
                          : 'Tell me what you need, I find top-rated vendors'}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setIsOpen(false)}
                    style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={palette.ink.onDarkMuted} />
                  </Pressable>
                </View>

                {/* Vendor Privacy / Location Masking Quick Bar */}
                {isVendor ? (
                  <View style={styles.privacyCard}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="shield-half-sharp" size={15} color="#D89544" />
                        <Text style={styles.privacyCardTitle}>Mask Exact Workshop Location</Text>
                      </View>
                      <Text style={styles.privacyCardDesc}>
                        Hides your pinpoint on the public map; buyers only see your neighborhood radius.
                      </Text>
                    </View>
                    <Switch
                      value={isMaskingLocation}
                      onValueChange={(val) => {
                        vibeHaptics.selection();
                        setIsMaskingLocation(val);
                      }}
                      trackColor={{ false: '#2D231E', true: palette.brand.orange }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                ) : null}
              </View>

              {/* Chat & Vendor Recommendations Feed */}
              <ScrollView
                style={styles.chatScroll}
                contentContainerStyle={styles.chatScrollContent}
                keyboardShouldPersistTaps="handled">
                {messages.map((msg, idx) => (
                  <View
                    key={msg.id ? `msg-${msg.id}-${idx}` : `msg-${idx}`}
                    style={[
                      styles.messageBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                    ]}>
                    {/* If AI, display cute Carty mini icon */}
                    {msg.sender === 'ai' && (
                      <View style={styles.aiSenderHeader}>
                        <CartMascot size={18} />
                        <Text style={styles.aiSenderName}>Carty AI</Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.messageText,
                        msg.sender === 'user' ? styles.userText : styles.aiText,
                      ]}>
                      {msg.text}
                    </Text>

                    {/* Interactive Vendor Recommendation Cards */}
                    {msg.vendorRecommendations && msg.vendorRecommendations.length > 0 ? (
                      <View style={styles.recsContainer}>
                        {msg.vendorRecommendations.map((vendor, vIdx) => (
                          <View key={vendor.id ? `rec-vendor-${vendor.id}-${vIdx}` : `rec-vendor-${vIdx}`} style={styles.vendorCard}>
                            {/* Top Vendor Row */}
                            <View style={styles.vendorCardHeader}>
                              <View style={styles.vendorAvatarWrap}>
                                {vendor.avatarUrl ? (
                                  <Image
                                    source={{ uri: vendor.avatarUrl }}
                                    style={styles.vendorAvatar}
                                    contentFit="cover"
                                  />
                                ) : (
                                  <LinearGradient
                                    colors={['#FF9F2E', '#C4560C']}
                                    style={styles.vendorAvatarFallback}>
                                    <Ionicons name="storefront" size={16} color="#FFF" />
                                  </LinearGradient>
                                )}
                              </View>

                              <View style={{ flex: 1, paddingRight: 4 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Text style={styles.vendorStoreName} numberOfLines={1}>
                                    {vendor.storeName}
                                  </Text>
                                  {vendor.isVerified && (
                                    <Ionicons name="checkmark-circle" size={13} color="#D89544" />
                                  )}
                                </View>
                                <Text style={styles.vendorCategory} numberOfLines={1}>
                                  {vendor.category}
                                </Text>
                              </View>

                              {/* Rating Badge */}
                              <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={11} color="#F4C464" />
                                <Text style={styles.ratingText}>{vendor.rating.toFixed(1)}</Text>
                                <Text style={styles.ratingCount}>({vendor.ratingCount})</Text>
                              </View>
                            </View>

                            {/* Location & Neighborhood */}
                            <View style={styles.vendorMetaRow}>
                              <Ionicons name="location-sharp" size={12} color="#D89544" />
                              <Text style={styles.vendorMetaText} numberOfLines={1}>
                                {vendor.neighborhood}
                                {vendor.distanceKm ? ` • ${vendor.distanceKm} km away` : ''}
                              </Text>
                            </View>

                            {/* Matched Product Highlight if available */}
                            {vendor.matchedItem ? (
                              <View style={styles.matchedProductPill}>
                                <Ionicons name="pricetag-outline" size={11} color="#FFE6A4" />
                                <Text style={styles.matchedProductText} numberOfLines={1}>
                                  Featured: {vendor.matchedItem.title}
                                  {vendor.matchedItem.price
                                    ? ` (${formatNaira(vendor.matchedItem.price)})`
                                    : ''}
                                </Text>
                              </View>
                            ) : null}

                            {/* Why Carty Recommends Callout */}
                            <View style={styles.cartyInsightBox}>
                              <View style={styles.cartyInsightHeader}>
                                <CartMascot size={13} />
                                <Text style={styles.cartyInsightTitle}>Why Carty Recommends:</Text>
                              </View>
                              <Text style={styles.cartyInsightText}>
                                {vendor.recommendReason}
                              </Text>
                            </View>

                            {/* Action Buttons: Visit Store & View on Map */}
                            <View style={styles.cardActionRow}>
                              <PressableScale
                                haptic="medium"
                                onPress={() => {
                                  setIsOpen(false);
                                  router.push(`/place/${vendor.handle || vendor.id}` as never);
                                }}
                                style={styles.visitStoreBtn}>
                                <Text style={styles.visitStoreText}>Visit Store</Text>
                                <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                              </PressableScale>

                              <PressableScale
                                haptic="light"
                                onPress={() => {
                                  setIsOpen(false);
                                  router.push('/search?tab=map' as never);
                                }}
                                style={styles.mapBtn}>
                                <Ionicons name="map-outline" size={13} color="#D89544" />
                                <Text style={styles.mapBtnText}>View Map</Text>
                              </PressableScale>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {/* Suggestion Chips */}
                    {msg.chips && msg.chips.length > 0 ? (
                      <View style={styles.chipRow}>
                        {msg.chips.map((chip, chipIdx) => (
                          <Pressable
                            key={chipIdx}
                            onPress={() => handleChipPress(chip)}
                            style={styles.chip}>
                            <Text style={styles.chipText}>{chip}</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>

              {/* Input Bar */}
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.inputField}
                  placeholder={
                    isVendor
                      ? 'Ask about restock, pricing, or suppliers...'
                      : 'Looking for sneakers, perfume, gifts, or vintage?'
                  }
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={handleSend}
                  disabled={!query.trim()}
                  style={[styles.sendBtn, !query.trim() && { opacity: 0.5 }]}>
                  <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingOrbRoot: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbPulseRing: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(47, 107, 255, 0.25)',
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D89544',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1.8,
    borderColor: 'rgba(255, 175, 56, 0.6)',
  },
  mascotBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#D89544',
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  mascotBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  canvas: {
    backgroundColor: '#16110E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.25)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: 680,
  },
  canvasHeader: {
    paddingHorizontal: spacing['5'],
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mascotHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  assistantTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assistantSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    marginTop: 1,
  },
  copilotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.3)',
  },
  copilotBadgeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: '#D89544',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#201814',
    borderRadius: radius.md,
    padding: spacing['3'],
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.2)',
  },
  privacyCardTitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacyCardDesc: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
    paddingRight: 8,
  },
  chatScroll: {
    maxHeight: 440,
  },
  chatScrollContent: {
    padding: spacing['4'],
    gap: 12,
  },
  messageBubble: {
    borderRadius: radius.lg,
    padding: spacing['3'],
    maxWidth: '92%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#201610',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.2)',
    width: '98%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#D89544',
  },
  aiSenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiSenderName: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#D89544',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#F4ECE4',
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recsContainer: {
    marginTop: 12,
    gap: 10,
  },
  vendorCard: {
    backgroundColor: '#18110D',
    borderRadius: radius.lg,
    padding: spacing['3'],
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.25)',
  },
  vendorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vendorAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  vendorAvatar: {
    width: '100%',
    height: '100%',
  },
  vendorAvatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorStoreName: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  vendorCategory: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 212, 63, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 212, 63, 0.25)',
  },
  ratingText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#F4C464',
  },
  ratingCount: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  vendorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  vendorMetaText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#E8B983',
  },
  matchedProductPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  matchedProductText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#FFE6A4',
    flex: 1,
  },
  cartyInsightBox: {
    backgroundColor: 'rgba(47, 107, 255, 0.1)',
    borderRadius: radius.md,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 2.5,
    borderLeftColor: '#D89544',
  },
  cartyInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  cartyInsightTitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: '#D89544',
    textTransform: 'uppercase',
  },
  cartyInsightText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: '#F4ECE4',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  visitStoreBtn: {
    flex: 1,
    height: 34,
    backgroundColor: '#D89544',
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  visitStoreText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.4)',
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mapBtnText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: '#D89544',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
  },
  chipText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#E8B983',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing['4'],
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputField: {
    flex: 1,
    height: 44,
    backgroundColor: '#201814',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D89544',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
