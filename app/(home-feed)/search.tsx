import { useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useMe } from '@/src/api/account/hooks';
import { useSearch } from '@/src/api/search/hooks';
import { useSearchHistory } from '@/src/store/search';
import { palette, radius, spacing, typography } from '@/src/theme';

import { ProductSearchMap } from '@/components/search/ProductSearchMap';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { formatKobo } from '@/src/utils/money';
import type { RankedProduct } from '@/src/api/types';

const TABS = ['Top', 'Products', 'Map', 'Places', 'People', 'Tags'] as const;
const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

// eslint-disable-next-line complexity
export default function SearchScreen() {
  const params = useLocalSearchParams<{ focus?: string }>();
  const [selectedProduct, setSelectedProduct] = useState<RankedProduct | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<typeof TABS[number]>(
    params.focus === 'people' ? 'People' : params.focus === 'map' ? 'Map' : 'Top',
  );
  const { data: me } = useMe();
  const { data, isLoading, isError } = useSearch({ q: query.trim(), limit: 20 });

  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory();

  const people = data?.people ?? [];
  const products = data?.products ?? [];
  const tags = data?.tags ?? [];
  const places = data?.places ?? [];

  const handleResultClick = (action: () => void) => {
    if (query.trim()) addHistory(query.trim());
    action();
  };

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
            onSubmitEditing={() => query.trim() && addHistory(query.trim())}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={palette.ink.onDarkMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Search Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'Map' ? (
        <ProductSearchMap vendors={places} searchQuery={query} />
      ) : !query ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {history.length > 0 ? (
            <View style={styles.historyContainer}>
              {history.map((h) => (
                <View key={h} style={styles.historyRow}>
                  <Pressable onPress={() => setQuery(h)} style={styles.historyItem}>
                    <View style={styles.historyIconWrapper}>
                      <Ionicons name="time-outline" size={20} color={palette.ink.onDarkStrong} />
                    </View>
                    <Text style={styles.historyText} numberOfLines={1}>{h}</Text>
                  </Pressable>
                  <Pressable onPress={() => removeHistory(h)} hitSlop={8}>
                    <Ionicons name="close-circle" size={24} color={palette.ink.onDarkMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search" size={36} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyTitle}>Search Vibe</Text>
              <Text style={styles.emptySub}>Type to search people, products, tags, and places.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
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
                      onPress={() => handleResultClick(() => {
                        if (me?.username === p.handle || me?.handle === p.handle) {
                          router.push('/profile');
                        } else {
                          router.push(`/u/${p.handle}` as never);
                        }
                      })}
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
                  {products.map((p, idx) => (
                    <Pressable
                      key={p.id ? `product-${p.id}-${idx}` : `product-${idx}`}
                      onPress={() => handleResultClick(() => setSelectedProduct(p))}
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
                    <Pressable key={t.tag} style={styles.trendingRow} onPress={() => handleResultClick(() => setQuery(t.tag))}>
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
                  <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Nearby Vendors & Places</Text>
                    <Pressable onPress={() => setTab('Map')}>
                      <Text style={styles.sectionLink}>View on Map ↗</Text>
                    </Pressable>
                  </View>
                  {places.map((place, idx) => {
                    const milesText = formatDistanceMiles(place);
                    const isMasked = place.showExactLocation === false;
                    const locationLabel = isMasked ? 'Neighborhood Zone (Masked)' : (place.address || 'Lagos, Nigeria');

                    return (
                      <Pressable
                        key={place.id ? `place-${place.id}-${idx}` : `place-${idx}`}
                        onPress={() => handleResultClick(() => router.push(`/place/${place.id}` as never))}
                        style={styles.placeCardRow}>
                        <Avatar size={46} initials={place.storeName[0]} />
                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <Text style={styles.peopleName} numberOfLines={1}>{place.storeName}</Text>
                            <View style={styles.proximityBadge}>
                              <Ionicons name="navigate" size={10} color={palette.brand.orange} />
                              <Text style={styles.proximityText}>{milesText}</Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <View style={styles.ratingBadgeMini}>
                              <Ionicons name="star" size={11} color="#F4C464" />
                              <Text style={[styles.ratingTextMini, { color: '#F4C464' }]}>{place.rating.toFixed(1)}</Text>
                              {place.ratingCount ? (
                                <Text style={styles.ratingCountMini}>({place.ratingCount})</Text>
                              ) : null}
                            </View>
                            <Text style={styles.metaDot}>·</Text>
                            <Ionicons name={isMasked ? 'shield-checkmark' : 'location-outline'} size={11} color={isMasked ? '#D89544' : 'rgba(255,255,255,0.6)'} />
                            <Text style={[styles.locationText, isMasked && { color: '#D89544' }]} numberOfLines={1}>
                              {locationLabel}
                            </Text>
                          </View>

                          {place.matchedProductTitle && (
                            <View style={styles.matchedProductPill}>
                              <Ionicons name="bag-handle" size={11} color={palette.brand.orange} />
                              <Text style={styles.matchedProductText} numberOfLines={1}>
                                In Stock: {place.matchedProductTitle} {place.matchedProductPrice ? `(${formatKobo(place.matchedProductPrice)})` : ''}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                      </Pressable>
                    );
                  })}
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

            {/* Floating Google Business Map Button */}
            {places.length > 0 && (
            <Pressable
              onPress={() => setTab('Map')}
              style={styles.floatingMapBtn}>
              <Ionicons name="map" size={16} color="#FFFFFF" />
              <Text style={styles.floatingMapBtnText}>
                Nearby on Map ({places.filter((p) => p.showOnMap !== false).length})
              </Text>
            </Pressable>
          )}
        </>
      )}

      <ProductQuickViewModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: 'rgba(47, 107, 255,0.18)',
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
  historyContainer: {
    paddingVertical: spacing['4'],
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: spacing['3'],
  },
  historyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: {
    ...typography.bodyLg,
    color: palette.ink.onDarkStrong,
    marginLeft: spacing['3'],
  },
  floatingMapBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.brand.orange,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingMapBtnText: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  placeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing['2'],
  },
  proximityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
  },
  proximityText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: palette.brand.orange,
  },
  ratingBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingTextMini: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  ratingCountMini: {
    ...typography.caption,
    color: 'rgba(245, 241, 234, 0.65)',
    fontSize: 10,
  },
  metaDot: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  },
  locationText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    flexShrink: 1,
  },
  matchedProductPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  matchedProductText: {
    ...typography.caption,
    color: palette.brand.orange,
    fontSize: 11,
    fontWeight: '600',
  },
});

function formatDistanceMiles(
  place: { lat?: number; lng?: number; distanceKm?: number },
  userLat = 6.5244,
  userLng = 3.3792,
) {
  let km = place.distanceKm;
  if (!km && place.lat && place.lng) {
    const dLat = (place.lat - userLat) * 111;
    const dLng = (place.lng - userLng) * 111;
    km = Math.sqrt(dLat * dLat + dLng * dLng);
  }
  if (!km || isNaN(km)) km = 1.2;
  const miles = (km * 0.621371).toFixed(1);
  return `${miles} miles away`;
}
