import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useMarketplaceHome } from '@/src/api/marketplace/hooks';
import { useCartCount } from '@/src/store/cart';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

function CartIcon() {
  const count = useCartCount();
  return (
    <View>
      <Ionicons name="cart-outline" size={22} color={palette.ink.onDarkStrong} />
      {count > 0 ? (
        <View style={cartIconStyles.badge}>
          <Text style={cartIconStyles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      ) : null}
    </View>
  );
}

const cartIconStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    lineHeight: 13,
    color: '#FFFFFF',
  },
});

export default function ShopScreen() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const { data, isLoading, isError } = useMarketplaceHome({
    category: activeCat === 'All' ? undefined : activeCat,
    limit: 50,
  });
  const products = data?.products ?? [];
  const categories = ['All', ...(data?.categories ?? [])];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query]);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push('/cart')}>
            <CartIcon />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={palette.ink.onDarkSoft} />
          <TextInput
            placeholder="Search products, vendors…"
            placeholderTextColor={palette.ink.onDarkMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={palette.ink.onDarkMuted} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {categories.map((c) => {
            const isActive = activeCat === c;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCat(c)}
                style={[styles.chip, isActive && styles.chipActive]}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {isLoading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="bag-outline" size={40} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyTitle}>Loading products…</Text>
            </View>
          ) : isError ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="cloud-offline-outline" size={40} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyTitle}>Couldn&apos;t load products</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search" size={40} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptySubtitle}>Try a different search or category.</Text>
            </View>
          ) : (
            filtered.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/product/${p.id}` as never)}
                style={styles.tile}>
                <Image source={p.media?.[0]?.url ? { uri: p.media[0].url } : PRODUCT_IMAGE} style={styles.tileImage} contentFit="cover" />
                <Text style={styles.tileName} numberOfLines={2}>{p.title}</Text>
                <Text style={styles.tilePrice}>{formatKobo(p.price)}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
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
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
  },
  searchBar: {
    marginHorizontal: spacing['5'],
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
  chipsRow: {
    paddingHorizontal: spacing['5'],
    gap: spacing['2'],
    paddingVertical: spacing['4'],
  },
  chip: {
    paddingHorizontal: spacing['4'],
    paddingVertical: 8,
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
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  chipTextActive: {
    color: palette.ink.onLightStrong,
  },
  grid: {
    paddingHorizontal: spacing['5'],
    paddingBottom: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    gap: 6,
  },
  emptyWrap: {
    width: '100%',
    paddingVertical: 64,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  emptySubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  tileImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  tileName: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  tilePrice: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.brand.orange,
  },
});
