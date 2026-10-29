import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useMe } from '@/src/api/account/hooks';
import { useVendor, useVendorProducts } from '@/src/api/vendors/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const BANNER = require('@/assets/figma/store-banner.png');

const TABS = ['Posts', 'Following', 'Followers'] as const;

export default function VendorStoreScreen() {
  const [tab, setTab] = useState<typeof TABS[number]>('Posts');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: me } = useMe();
  const handle = me?.handle;
  const { data: vendor, isLoading: vendorLoading } = useVendor(handle);
  const { data: products = [], isLoading: productsLoading } = useVendorProducts(handle);
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'All' && product.category !== activeCategory) return false;
    if (query.trim() && !product.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={[styles.iconBtn, styles.backBtn]}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable hitSlop={8} style={[styles.iconBtn, styles.shareBtn]}>
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Pressable onPress={() => router.push('/vendor-store-setup/store-details')} style={styles.bannerWrap}>
            <Image source={vendor?.photos?.[0] ? { uri: vendor.photos[0] } : BANNER} style={styles.banner} contentFit="cover" />
            <View style={styles.editBannerPill}>
              <Ionicons name="camera" size={13} color="#FFFFFF" />
              <Text style={styles.editBannerText}>Edit Store Banner</Text>
            </View>
          </Pressable>
          <View style={styles.profileBlock}>
            <View style={styles.avatarRing}>
              <Avatar size={84} source={vendor?.photos?.[1] ? { uri: vendor.photos[1] } : undefined} initials={(vendor?.storeName ?? me?.name ?? 'V')[0]} />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.storeName}>{vendor?.storeName ?? me?.name ?? 'Store'}</Text>
              {vendor?.verified ? <VerifiedCheck tone="success" size={16} /> : null}
            </View>
            <View style={styles.starRow}>
              <Ionicons name="star" size={14} color={palette.brand.amber} />
              <Text style={styles.rating}>{(vendor?.rating ?? 0).toFixed(1)}</Text>
              <Text style={styles.reviewsCount}>({vendor?.reviews ?? 0} Reviews)</Text>
            </View>
            <View style={styles.followActions}>
              <Pressable
                onPress={() => router.push('/products/add' as never)}
                style={({ pressed }) => [styles.followBtn, styles.notFollowing, pressed && { opacity: 0.85 }]}>
                <Text style={styles.followLabel}>Add product</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/vendor-store-setup/store-details')}
                style={({ pressed }) => [styles.msgBtn, pressed && { opacity: 0.85 }]}>
                <Ionicons name="settings-outline" size={16} color={palette.ink.onDarkStrong} />
                <Text style={styles.msgLabel}>Edit store</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.tabs}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
                <Text style={[styles.tabLabel, tab === t && styles.tabActive]}>{t}</Text>
                {tab === t ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            ))}
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={palette.ink.onDarkSoft} />
            <TextInput
              placeholder="Search products"
              placeholderTextColor={palette.ink.onDarkMuted}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            {categories.map((c) => (
              <Pressable
                key={c}
                onPress={() => setActiveCategory(c)}
                style={[styles.chip, activeCategory === c && styles.chipActive]}>
                <Text style={[styles.chipText, activeCategory === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.grid}>
            {vendorLoading || productsLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={palette.brand.orange} />
                <Text style={styles.emptyText}>Loading store…</Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No products found.</Text>
              </View>
            ) : filteredProducts.map((p, idx) => (
              <Pressable
                key={p.id ? `store-prod-${p.id}-${idx}` : `store-prod-${idx}`}
                onPress={() => router.push(`/product/${p.id}` as never)}
                style={styles.tile}>
                <Image source={p.media?.[0]?.url ? { uri: p.media[0].url } : PRODUCT_IMAGE} style={styles.tileImage} contentFit="cover" />
                <Text style={styles.tileName} numberOfLines={2}>{p.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.tilePrice}>{formatKobo(p.price)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  iconBtn: {
    position: 'absolute',
    top: 56,
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    zIndex: 5,
  },
  backBtn: { left: 16 },
  shareBtn: { right: 16 },
  scroll: { paddingBottom: 100 },
  bannerWrap: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  banner: { height: 160, width: '100%' },
  editBannerPill: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  editBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  profileBlock: { alignItems: 'center', gap: spacing['1'], marginTop: -42 },
  avatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: palette.bg.espressoEnd,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  storeName: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: palette.ink.onDarkStrong,
  },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  reviewsCount: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  followActions: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['3'],
    paddingHorizontal: spacing['5'],
    width: '100%',
  },
  followBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFollowing: { backgroundColor: palette.brand.orange },
  followingBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
  },
  followLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  followingLabel: { color: palette.ink.onDarkStrong },
  msgBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  msgLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    marginTop: spacing['4'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing['3'],
    alignItems: 'center',
    gap: spacing['2'],
  },
  tabLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  tabActive: {
    color: palette.ink.onDarkStrong,
  },
  tabIndicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.brand.orange,
  },
  searchBar: {
    marginTop: spacing['4'],
    marginHorizontal: spacing['5'],
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
  chipsRow: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    gap: spacing['2'],
  },
  chip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipActive: {
    backgroundColor: palette.bg.surface,
    borderColor: palette.bg.surface,
  },
  chipText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  chipTextActive: {
    color: palette.ink.onLightStrong,
  },
  grid: {
    paddingHorizontal: spacing['5'],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    justifyContent: 'space-between',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing['8'],
    gap: spacing['2'],
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  tile: { width: '48%', gap: 4 },
  tileImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  tileName: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkStrong,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing['1'] },
  tilePrice: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  tileOldPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
    textDecorationLine: 'line-through',
  },
});
