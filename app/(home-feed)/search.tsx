import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, radius, spacing, typography } from '@/src/theme';

const RECENT = ['Ankara dresses', 'Sarah\'s Boutique', 'leopard sandals', 'beauty kit'];
const TRENDING = [
  { tag: '#vibesummerstyle', count: '12.4K posts' },
  { tag: '#NaijaFashion', count: '34.1K posts' },
  { tag: '#FlashSale', count: '2.8K posts' },
  { tag: '#OOTD', count: '45.6K posts' },
];

const PEOPLE = [
  { handle: 'sarahsboutique', name: 'Sarah\'s Boutique', avatar: require('@/assets/figma/store-avatar.png'), verified: true, followers: '12.5K' },
  { handle: 'aisha-bello', name: 'Aisha Bello', avatar: require('@/assets/figma/story-1.png'), followers: '4.2K' },
  { handle: 'janet-ogborini', name: 'Janet Ogborini', avatar: require('@/assets/figma/story-2.png'), verified: true, followers: '28.6K' },
];

const PRODUCTS = [
  { id: 'p1', name: 'Ankara high shoulder fitted gown', price: '₦24,990' },
  { id: 'p2', name: 'Birkin handbag deluxe', price: '₦149,000' },
  { id: 'p3', name: 'Leopard heeled sandals', price: '₦38,500' },
];

const TABS = ['Top', 'People', 'Products', 'Tags'] as const;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<typeof TABS[number]>('Top');

  const q = query.trim().toLowerCase();

  const filteredPeople = useMemo(
    () => PEOPLE.filter((p) => !q || p.name.toLowerCase().includes(q) || p.handle.includes(q)),
    [q]
  );
  const filteredProducts = useMemo(
    () => PRODUCTS.filter((p) => !q || p.name.toLowerCase().includes(q)),
    [q]
  );
  const filteredTags = useMemo(
    () => TRENDING.filter((t) => !q || t.tag.toLowerCase().includes(q)),
    [q]
  );

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
            placeholder="Search Vibe"
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
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <Pressable hitSlop={8}>
                <Text style={styles.sectionLink}>Clear</Text>
              </Pressable>
            </View>
            <View style={{ gap: spacing['2'] }}>
              {RECENT.map((r) => (
                <Pressable key={r} onPress={() => setQuery(r)} style={styles.recentRow}>
                  <Ionicons name="time-outline" size={16} color={palette.ink.onDarkMuted} />
                  <Text style={styles.recentText}>{r}</Text>
                  <Pressable hitSlop={6}>
                    <Ionicons name="close" size={14} color={palette.ink.onDarkMuted} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <View style={{ gap: spacing['2'] }}>
              {TRENDING.map((t) => (
                <Pressable key={t.tag} onPress={() => setQuery(t.tag)} style={styles.trendingRow}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>#</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tagText}>{t.tag}</Text>
                    <Text style={styles.tagCount}>{t.count}</Text>
                  </View>
                  <Ionicons name="trending-up" size={16} color={palette.brand.orange} />
                </Pressable>
              ))}
            </View>
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
            {(tab === 'Top' || tab === 'People') && filteredPeople.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>People</Text>
                {filteredPeople.map((p) => (
                  <Pressable
                    key={p.handle}
                    onPress={() => router.push(`/u/${p.handle}` as never)}
                    style={styles.peopleRow}>
                    <Avatar size={44} source={p.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.peopleName}>{p.name}{p.verified ? ' ✓' : ''}</Text>
                      <Text style={styles.peopleHandle}>@{p.handle} · {p.followers} followers</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {(tab === 'Top' || tab === 'Products') && filteredProducts.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Products</Text>
                {filteredProducts.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/product/${p.id}` as never)}
                    style={styles.productRow}>
                    <Image source={require('@/assets/figma/product-sample.png')} style={styles.productImg} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                      <Text style={styles.productPrice}>{p.price}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
                  </Pressable>
                ))}
              </View>
            ) : null}

            {(tab === 'Top' || tab === 'Tags') && filteredTags.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                {filteredTags.map((t) => (
                  <Pressable key={t.tag} style={styles.trendingRow}>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tagText}>{t.tag}</Text>
                      <Text style={styles.tagCount}>{t.count}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {filteredPeople.length === 0 && filteredProducts.length === 0 && filteredTags.length === 0 ? (
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
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
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
    backgroundColor: 'rgba(253,134,22,0.18)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
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
