import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useSearch } from '@/src/api/search/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

const TABS = ['Top', 'People', 'Products', 'Tags', 'Places'] as const;
const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

export default function SearchScreen() {
  const params = useLocalSearchParams<{ focus?: string }>();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<typeof TABS[number]>(
    params.focus === 'people' ? 'People' : 'Top',
  );
  const { data, isLoading, isError } = useSearch({ q: query.trim(), limit: 20 });

  const people = data?.people ?? [];
  const products = data?.products ?? [];
  const tags = data?.tags ?? [];
  const places = data?.places ?? [];

  return (
    <ScreenContainer variant="espresso" edges={['top']}>
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={palette.ink.onDarkSoft} />
          <TextInput
            autoFocus
            placeholder="Search people, @handles, #hashtags"
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
      </View>

      {!query ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.empty}>
            <Ionicons name="search" size={36} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyTitle}>Search Vibe</Text>
            <Text style={styles.emptySub}>Type to search people, products, tags, and places.</Text>
          </View>
        </ScrollView>
      ) : (
        <>
          <View style={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
            {isLoading ? (
              <View style={styles.empty}>
                <Ionicons name="search" size={36} color={palette.ink.onDarkMuted} />
                <Text style={styles.emptyTitle}>Searching…</Text>
              </View>
            ) : isError ? (
              <View style={styles.empty}>
                <Ionicons name="cloud-offline-outline" size={36} color={palette.ink.onDarkMuted} />
                <Text style={styles.emptyTitle}>Search failed</Text>
              </View>
            ) : null}
            {(tab === 'Top' || tab === 'People') && people.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>People</Text>
                {people.map((p) => (
                  <Pressable
                    key={p.handle}
                    onPress={() => router.push(`/u/${p.handle}` as never)}
                    style={styles.peopleRow}>
                    <Avatar size={44} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={p.name[0]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.peopleName}>{p.name}{p.kycVerified ? ' ✓' : ''}</Text>
                      <Text style={styles.peopleHandle}>@{p.handle} · {p.kind}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {(tab === 'Top' || tab === 'Products') && products.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Products</Text>
                {products.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/product/${p.id}` as never)}
                    style={styles.productRow}>
                    <Image source={p.media?.[0]?.url ? { uri: p.media[0].url } : PRODUCT_IMAGE} style={styles.productImg} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName} numberOfLines={2}>{p.title}</Text>
                      <Text style={styles.productPrice}>{formatKobo(p.price)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {(tab === 'Top' || tab === 'Tags') && tags.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                {tags.map((t) => (
                  <Pressable key={t.tag} style={styles.trendingRow}>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tagText}>{t.tag}</Text>
                      <Text style={styles.tagCount}>{t.count.toLocaleString()} posts</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {(tab === 'Top' || tab === 'Places') && places.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Places</Text>
                {places.map((place) => (
                  <Pressable
                    key={place.id}
                    onPress={() => router.push(`/u/${place.handle}` as never)}
                    style={styles.peopleRow}>
                    <Avatar size={44} source={place.avatarUrl ? { uri: place.avatarUrl } : undefined} initials={place.storeName[0]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.peopleName}>{place.storeName}</Text>
                      <Text style={styles.peopleHandle}>
                        @{place.handle} · {place.rating.toFixed(1)} rating
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {!isLoading && !isError && people.length === 0 && products.length === 0 && tags.length === 0 && places.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="search" size={36} color={palette.ink.onDarkMuted} />
                <Text style={styles.emptyTitle}>No results for &quot;{query}&quot;</Text>
                <Text style={styles.emptySub}>Try different keywords or check spelling.</Text>
              </View>
            ) : null}
          </ScrollView>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
  scroll: { paddingBottom: 40, gap: spacing['4'] },
  section: { gap: spacing['2'] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
  },
  sectionLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: 8,
  },
  recentText: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: 8,
  },
  tagBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(216, 149, 68,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBadgeText: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.brand.orange,
  },
  tagText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  tagCount: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
  },
  tab: {
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  tabActive: { backgroundColor: palette.bg.surface, borderColor: palette.bg.surface },
  tabLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  tabLabelActive: { color: palette.ink.onLightStrong },
  results: { paddingBottom: 40, gap: spacing['4'] },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: 8,
  },
  peopleName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  peopleHandle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: 8,
  },
  productImg: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  productPrice: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.brand.orange,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: spacing['2'],
  },
  emptyTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  emptySub: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
});
