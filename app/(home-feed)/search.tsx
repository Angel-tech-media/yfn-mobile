import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { ProductSearchMap } from '@/components/search/ProductSearchMap';
import { Avatar } from '@/components/ui/Avatar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useMe } from '@/src/api/account/hooks';
import { useSearch } from '@/src/api/search/hooks';
import type { RankedProduct } from '@/src/api/types';
import { useSearchHistory } from '@/src/store/search';
import { continuous, useUi } from '@/src/theme/ui';
import { formatKobo } from '@/src/utils/money';

const TABS = ['Top', 'Products', 'Map', 'Places', 'People', 'Tags'] as const;
const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

export default function SearchScreen() {
  const ui = useUi();
  const params = useLocalSearchParams<{ focus?: string }>();
  const [selectedProduct, setSelectedProduct] = useState<RankedProduct | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    params.focus === 'people' ? 'People' : params.focus === 'map' ? 'Map' : 'Top',
  );
  const { data: me } = useMe();
  const { data, isLoading, isError } = useSearch({ q: query.trim(), limit: 20 });

  const { history, addHistory, removeHistory } = useSearchHistory();

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
      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={[styles.backBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <Ionicons name="chevron-back" size={20} color={ui.label} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <Ionicons name="search" size={18} color={ui.secondaryLabel} />
          <TextInput
            autoFocus
            placeholder="Search products, sellers, @handles…"
            placeholderTextColor={ui.secondaryLabel}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => query.trim() && addHistory(query.trim())}
            returnKeyType="search"
            style={[styles.searchInput, { color: ui.label }]}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={ui.secondaryLabel} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[
                  styles.tab,
                  { backgroundColor: active ? ui.ink : ui.secondary },
                ]}>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? ui.inkForeground : ui.secondaryForeground },
                  ]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {tab === 'Map' ? (
        <ProductSearchMap vendors={places} searchQuery={query} />
      ) : !query ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {history.length > 0 ? (
            <View style={styles.historyContainer}>
              <Text style={[styles.sectionTitle, { color: ui.secondaryLabel }]}>RECENT SEARCHES</Text>
              {history.map((h) => (
                <View key={h} style={[styles.historyRow, { borderBottomColor: ui.separator }]}>
                  <Pressable onPress={() => setQuery(h)} style={styles.historyItem}>
                    <Ionicons name="time-outline" size={18} color={ui.secondaryLabel} />
                    <Text style={[styles.historyText, { color: ui.label }]} numberOfLines={1}>
                      {h}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => removeHistory(h)} hitSlop={8}>
                    <Ionicons name="close" size={18} color={ui.secondaryLabel} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={[styles.emptyIconBox, { backgroundColor: ui.secondary }]}>
                <Ionicons name="search" size={28} color={ui.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: ui.label }]}>Search Aktive</Text>
              <Text style={[styles.emptySub, { color: ui.secondaryLabel }]}>
                Find Lagos sellers, thrift drops, @handles, and nearby spots.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
          {isLoading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: ui.secondaryLabel }]}>Searching…</Text>
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: ui.label }]}>Search failed</Text>
            </View>
          ) : null}

          {(tab === 'Top' || tab === 'People') && people.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: ui.secondaryLabel }]}>PEOPLE & STORES</Text>
              {people.map((p) => (
                <Pressable
                  key={p.handle}
                  onPress={() =>
                    handleResultClick(() => {
                      if (me?.username === p.handle || me?.handle === p.handle) {
                        router.push('/profile' as never);
                      } else {
                        router.push(`/u/${p.handle}` as never);
                      }
                    })
                  }
                  style={[styles.cardRow, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                  <Avatar
                    size={42}
                    source={p.avatarUrl ? { uri: p.avatarUrl } : undefined}
                    initials={p.name[0]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.peopleName, { color: ui.label }]}>
                      {p.name}
                      {p.kycVerified ? ' ✓' : ''}
                    </Text>
                    <Text style={[styles.peopleHandle, { color: ui.secondaryLabel }]}>
                      @{p.handle} · {p.kind}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={ui.secondaryLabel} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {(tab === 'Top' || tab === 'Products') && products.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: ui.secondaryLabel }]}>PRODUCTS</Text>
              {products.map((p, idx) => (
                <Pressable
                  key={p.id ? `product-${p.id}-${idx}` : `product-${idx}`}
                  onPress={() => handleResultClick(() => router.push(`/product/${p.id}` as never))}
                  style={[styles.cardRow, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                  <Image
                    source={p.media?.[0]?.url ? { uri: p.media[0].url } : PRODUCT_IMAGE}
                    style={styles.productImg}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.peopleName, { color: ui.label }]} numberOfLines={2}>
                      {p.title}
                    </Text>
                    <Text style={[styles.productPrice, { color: ui.gold }]}>
                      {formatKobo(p.price)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={ui.secondaryLabel} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {(tab === 'Top' || tab === 'Tags') && tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: ui.secondaryLabel }]}>TAGS</Text>
              {tags.map((t) => (
                <Pressable
                  key={t.tag}
                  style={[styles.cardRow, { backgroundColor: ui.card, borderColor: ui.separator }]}
                  onPress={() => handleResultClick(() => setQuery(t.tag))}>
                  <View style={[styles.tagBadge, { backgroundColor: ui.secondary }]}>
                    <Text style={[styles.tagBadgeText, { color: ui.accent }]}>#</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.peopleName, { color: ui.label }]}>{t.tag}</Text>
                    <Text style={[styles.peopleHandle, { color: ui.secondaryLabel }]}>
                      {t.count.toLocaleString()} posts
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>
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
    gap: 8,
    paddingVertical: 6,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 14,
    paddingVertical: 0,
  },
  tabsWrap: {
    maxHeight: 46,
    marginBottom: 8,
  },
  tabsRow: {
    gap: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  scroll: { paddingBottom: 40 },
  results: { paddingBottom: 40, gap: 18 },
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  peopleName: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  peopleHandle: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
    marginTop: 1,
  },
  productImg: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  productPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
  },
  tagBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBadgeText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  historyContainer: {
    paddingTop: 12,
    gap: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: 8,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...continuous,
  },
  emptyTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  emptySub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
