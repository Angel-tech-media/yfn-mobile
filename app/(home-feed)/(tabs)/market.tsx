import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Badge, Chip } from '@/components/kit/Chip';
import { Card } from '@/components/kit/Card';
import { NavIconButton, SearchField } from '@/components/kit/Fields';
import { LargeTitleHeader, SectionHeader } from '@/components/kit/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { useFeedReels } from '@/src/api/feed/hooks';
import { useMarketplaceHome, useTopRatedVendors } from '@/src/api/marketplace/hooks';
import { SECTORS } from '@/src/config/sectors';
import { useCartCount } from '@/src/store/cart';
import { useCarty } from '@/src/store/carty';
import { corner, continuous, layout, type, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

import type { RankedProduct, Reel, TopRatedResponse } from '@/src/api/types';

export default function MarketScreen() {
  const ui = useUi();
  const openCarty = useCarty((s) => s.open);
  const [selectedProduct, setSelectedProduct] = useState<RankedProduct | null>(null);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: home, isError, isLoading, refetch } = useMarketplaceHome({ category, limit: 30 });
  const { data: topRated = [] } = useTopRatedVendors({ category });
  const { data: reels = [] } = useFeedReels({ limit: 8 });
  const cartCount = useCartCount();
  const products = (home?.products ?? []).filter(isRealProduct);
  const categories = Array.from(
    new Set([...SECTORS.map((s) => s.label), ...uniqueCategories(products)]),
  );
  const vendors = topRated.filter(isRealVendor);

  return (
    <EspressoBackground>
      <LargeTitleHeader
        title="Market"
        subtitle={
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={12} color={ui.lime} />
            <Text style={[type.caption, { color: ui.secondaryLabel }]}>
              Delivering to Lagos, Nigeria
            </Text>
          </View>
        }
        trailing={
          <>
            <NavIconButton icon="search-outline" label="Search" onPress={() => router.push('/search' as never)} />
            <NavIconButton icon="bag-outline" label="Cart" badge={cartCount} onPress={() => router.push('/cart' as never)} />
          </>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.pad}>
          <SearchField
            icon="sparkles"
            placeholder="Ask Carty what you're shopping for"
            onPress={openCarty}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <Chip label="All" selected={!category} onPress={() => setCategory(undefined)} />
          {categories.map((item, idx) => (
            <Chip
              key={item || `category-${idx}`}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>

        {!category ? (
          <View style={styles.pad}>
            <View style={[styles.promoCard, { borderColor: 'rgba(200, 255, 59, 0.28)' }]}>
              <LinearGradient
                colors={['#182D22', '#0C1812']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.promoContent}>
                <View style={styles.promoTopRow}>
                  <View style={[styles.promoBadge, { backgroundColor: ui.lime }]}>
                    <Text style={[styles.promoBadgeText, { color: ui.limeForeground }]}>Weekend drop</Text>
                  </View>
                  <Ionicons name="sparkles" size={15} color={ui.lime} />
                </View>
                <Text style={[type.title2, styles.promoHeading]}>
                  Up to 30% off local creators
                </Text>
                <Text style={[type.footnote, styles.promoSub]}>
                  Shop verified Nigerian vendors • Secured with escrow
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <Text style={[type.callout, styles.state, { color: ui.secondaryLabel }]}>Loading market…</Text>
        ) : isError ? (
          <View style={styles.stateBlock}>
            <Text style={[type.callout, { color: ui.secondaryLabel }]}>Couldn't load the market.</Text>
            <Chip label="Try again" selected onPress={() => refetch()} />
          </View>
        ) : (
          <>
            {vendors.length ? (
              <View style={styles.section}>
                <SectionHeader
                  title="Top vendors"
                  action={
                    <PressableScale haptic="light" onPress={() => router.push('/search?focus=map' as never)}>
                      <Text style={[type.subhead, { color: ui.accent }]}>See map</Text>
                    </PressableScale>
                  }
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
                  {vendors.map((vendor, idx) => (
                    <VendorCard key={vendor.id ? `vendor-${vendor.id}` : `vendor-${idx}`} vendor={vendor} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {reels.length ? (
              <View style={styles.section}>
                <SectionHeader
                  title="Watch & shop"
                  action={
                    <PressableScale haptic="light" onPress={() => router.push('/reels' as never)}>
                      <Text style={[type.subhead, { color: ui.accent }]}>See all</Text>
                    </PressableScale>
                  }
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
                  {reels.map((r, idx) => (
                    <ReelCard key={r.id ? `reel-${r.id}` : `reel-${idx}`} reel={r} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.section}>
              <SectionHeader title={category ?? 'Trending now'} />
              {products.length ? (
                <View style={styles.grid}>
                  {products.map((product, idx) => (
                    <ProductCard
                      key={product.id ? `product-${product.id}` : `product-${idx}`}
                      product={product}
                      style={styles.gridItem}
                      onPress={() => setSelectedProduct(product)}
                    />
                  ))}
                </View>
              ) : (
                <Text style={[type.callout, styles.state, { color: ui.secondaryLabel }]}>
                  Nothing here yet. Try another category.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <ProductQuickViewModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </EspressoBackground>
  );
}

function VendorCard({ vendor }: { vendor: TopRatedResponse[number] }) {
  const ui = useUi();
  return (
    <Card onPress={() => router.push(`/place/${vendor.id}` as never)} style={styles.vendorCard} padded>
      <View style={[styles.vendorAvatar, { backgroundColor: ui.accent }]}>
        <Text style={[type.headline, { color: ui.onAccent }]}>{initialsFor(vendor.storeName)}</Text>
      </View>
      <Text style={[type.headline, { color: ui.label }]} numberOfLines={1}>
        {vendor.storeName}
      </Text>
      <View style={styles.vendorMeta}>
        <Ionicons name="star" size={12} color={ui.gold} />
        <Text style={[type.footnote, { color: ui.gold }]}>
          {vendor.rating.toFixed(1)}
        </Text>
        {typeof vendor.distance === 'number' ? (
          <Text style={[type.footnote, { color: ui.secondaryLabel }]}>
            {`  ·  ${vendor.distance.toFixed(1)} km`}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const ui = useUi();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Reel by ${reel.author.name}`}
      onPress={() => router.push(`/reel?id=${reel.id}` as never)}
      haptic="light"
      scaleTo={0.97}
      style={[styles.reelCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
      {reel.coverUrl ? (
        <Image source={{ uri: reel.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      ) : null}
      <LinearGradient colors={['transparent', 'rgba(5,7,15,0.78)']} style={StyleSheet.absoluteFill} />
      {reel.product ? (
        <View style={styles.reelBadge}>
          <Badge tone="price" icon="bag-handle" label={formatKobo(reel.product.price)} />
        </View>
      ) : null}
      <View style={styles.reelMeta}>
        <Text style={[type.subhead, { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
          {reel.author.name}
        </Text>
        <Text style={[type.footnote, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={2}>
          {reel.caption}
        </Text>
      </View>
    </PressableScale>
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
  return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
}

function initialsFor(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'Y'
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120, gap: layout.sectionGap },
  pad: { paddingHorizontal: layout.gutter },
  chipRow: { paddingHorizontal: layout.gutter, gap: 8 },
  section: { gap: 14 },
  hRow: { paddingHorizontal: layout.gutter, gap: layout.cardGap },
  state: { textAlign: 'center', padding: 24 },
  stateBlock: { alignItems: 'center', gap: 14, padding: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingHorizontal: layout.gutter },
  gridItem: { width: '47.5%' },
  vendorCard: { width: 148, gap: 10 },
  vendorAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reelCard: {
    width: 150,
    aspectRatio: 9 / 14,
    borderRadius: corner.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  reelBadge: { position: 'absolute', top: 10, left: 10 },
  reelMeta: { padding: 12, gap: 2 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  promoCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
    ...continuous,
  },
  promoContent: {
    gap: 8,
  },
  promoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  promoBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  promoHeading: {
    color: '#FAFAFA',
    fontFamily: 'InterTight_700Bold',
    fontSize: 20,
    lineHeight: 24,
  },
  promoSub: {
    color: 'rgba(250, 250, 250, 0.72)',
    fontFamily: 'Inter_400Regular',
  },
});
