import { useState, type ReactNode } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useFeedReels } from '@/src/api/feed/hooks';
import { useMarketplaceHome, useTopRatedVendors } from '@/src/api/marketplace/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';

import { formatKobo } from '@/src/utils/money';

import type { RankedProduct, Reel, TopRatedResponse } from '@/src/api/types';

export default function MarketScreen() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: home, isError, isLoading, refetch } = useMarketplaceHome({ category, limit: 30 });
  const { data: topRated = [] } = useTopRatedVendors({ category });
  const { data: reels = [] } = useFeedReels({ limit: 8 });
  const products = (home?.products ?? []).filter(isRealProduct);
  const categories = uniqueCategories(products);
  const vendors = topRated.filter(isRealVendor);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Market</Text>
          <Pressable onPress={() => router.push('/search?focus=products' as never)} style={styles.iconBtn}>
            <Ionicons name="search" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            <Pressable
              onPress={() => setCategory(undefined)}
              style={[styles.categoryChip, !category && styles.categoryChipOn]}>
              <Text style={[styles.categoryLabel, !category && styles.categoryLabelOn]}>All</Text>
            </Pressable>
            {categories.map((item) => {
              const selected = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.categoryChip, selected && styles.categoryChipOn]}>
                  <Text style={[styles.categoryLabel, selected && styles.categoryLabelOn]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {isLoading ? (
            <Text style={styles.stateText}>Loading market...</Text>
          ) : isError ? (
            <View style={styles.stateBlock}>
              <Text style={styles.stateText}>Could not load market.</Text>
              <Pressable onPress={() => refetch()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {reels.length ? (
                <Section title="Reels">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reelRow}>
                    {reels.map((reel) => (
                      <ReelCard key={reel.id} reel={reel} />
                    ))}
                  </ScrollView>
                </Section>
              ) : null}

              {vendors.length ? (
                <Section title="Top rated vendors">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vendorRow}>
                    {vendors.map((vendor) => (
                      <Pressable key={vendor.id} style={styles.vendorCard}>
                        <View style={styles.vendorAvatar}>
                          <Text style={styles.vendorInitial}>{initialsFor(vendor.storeName)}</Text>
                        </View>
                        <Text style={styles.vendorName} numberOfLines={1}>{vendor.storeName}</Text>
                        <Text style={styles.vendorMeta}>{vendor.rating.toFixed(1)} · {vendor.ratingCount} reviews</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Section>
              ) : null}

              <Section title="Products">
                {products.length ? (
                  <View style={styles.productGrid}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.stateText}>No products found.</Text>
                )}
              </Section>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  return (
    <Pressable onPress={() => router.push(`/reel?id=${reel.id}` as never)} style={styles.reelCard}>
      {reel.coverUrl ? (
        <Image source={{ uri: reel.coverUrl }} style={styles.reelImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.reelImage} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
      <View style={styles.reelMeta}>
        <Text style={styles.reelAuthor} numberOfLines={1}>{reel.author.name}</Text>
        <Text style={styles.reelCaption} numberOfLines={2}>{reel.caption}</Text>
      </View>
    </Pressable>
  );
}

function ProductCard({ product }: { product: RankedProduct }) {
  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  return (
    <Pressable onPress={() => router.push(`/product/${product.id}` as never)} style={styles.productCard}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.productImage} />
      )}
      <View style={styles.productBody}>
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.productMeta}>{product.category}</Text>
        <Text style={styles.productPrice}>{formatKobo(product.price)}</Text>
      </View>
    </Pressable>
  );
}

function isRealVendor(vendor: TopRatedResponse[number]) {
  return !hasSeedMarker(vendor.storeName);
}

function isRealProduct(product: RankedProduct) {
  return !hasSeedMarker(product.title) && product.title.trim().toLowerCase() !== 'ankara jacket';
}

function hasSeedMarker(value: string) {
  const normalized = value.toLowerCase();
  return ['demo', 'sample', 'dummy', 'placeholder', 'test vendor', 'test product'].some((term) =>
    normalized.includes(term),
  );
}

function uniqueCategories(products: RankedProduct[]) {
  const productCategories = products
    .map((product) => product.category)
    .filter(Boolean);
  return Array.from(new Set(productCategories));
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
  },
  title: { ...typography.h2, color: palette.ink.onDarkStrong },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  scroll: { paddingBottom: 100, gap: spacing['4'] },
  categoryRow: { paddingHorizontal: spacing['5'], gap: spacing['2'], paddingBottom: spacing['2'] },
  categoryChip: {
    height: 34,
    paddingHorizontal: spacing['3'],
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  categoryChipOn: { backgroundColor: palette.bg.surface },
  categoryLabel: { ...typography.caption, color: palette.ink.onDarkSoft, fontFamily: typography.bodyEmphasis.fontFamily },
  categoryLabelOn: { color: palette.ink.onLightStrong },
  stateBlock: { alignItems: 'center', gap: spacing['3'], padding: spacing['5'] },
  stateText: { ...typography.body, color: palette.ink.onDarkSoft, textAlign: 'center', padding: spacing['4'] },
  retryBtn: {
    height: 36,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  section: { gap: spacing['3'] },
  sectionTitle: { ...typography.title, color: palette.ink.onDarkStrong, paddingHorizontal: spacing['5'] },
  reelRow: { gap: spacing['3'], paddingHorizontal: spacing['5'] },
  reelCard: { width: 170, height: 260, borderRadius: radius.lg, overflow: 'hidden' },
  reelImage: { width: '100%', height: '100%' },
  reelMeta: { position: 'absolute', left: spacing['3'], right: spacing['3'], bottom: spacing['3'], gap: 2 },
  reelAuthor: { ...typography.bodyEmphasis, color: '#fff' },
  reelCaption: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
  vendorRow: { gap: spacing['3'], paddingHorizontal: spacing['5'] },
  vendorCard: {
    width: 145,
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: spacing['2'],
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
  vendorInitial: { ...typography.bodyEmphasis, color: '#fff' },
  vendorName: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  vendorMeta: { ...typography.caption, color: palette.ink.onDarkMuted },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['3'], paddingHorizontal: spacing['5'] },
  productCard: {
    width: '47.5%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  productImage: { width: '100%', aspectRatio: 1 },
  productBody: { padding: spacing['3'], gap: 3 },
  productTitle: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  productMeta: { ...typography.caption, color: palette.ink.onDarkMuted },
  productPrice: { ...typography.bodyEmphasis, color: palette.brand.orange },
});
