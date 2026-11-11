import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { ProductCard } from '@/components/product/ProductCard';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import {
  categories,
  getPerson,
  products,
  useApp,
  vendors,
  type Product,
} from '@/src/data/lovable-data';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

const sorts = ['Popular', 'Price: low', 'Price: high', 'Top rated'] as const;

export default function MarketScreen() {
  const ui = useUi();
  const cartCount = useApp((s) => s.cart.reduce((n, l) => n + l.qty, 0));

  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [sortIndex, setSortIndex] = useState(0);

  const currentSort = sorts[sortIndex];

  const cycleSort = () => {
    setSortIndex((prev) => (prev + 1) % sorts.length);
  };

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (cat === 'all' || p.category === cat) &&
        p.name.toLowerCase().includes(q.toLowerCase())
    );
    if (currentSort === 'Price: low') l = [...l].sort((a, b) => a.price - b.price);
    if (currentSort === 'Price: high') l = [...l].sort((a, b) => b.price - a.price);
    if (currentSort === 'Top rated') l = [...l].sort((a, b) => b.rating - a.rating);
    if (currentSort === 'Popular') l = [...l].sort((a, b) => b.reviews - a.reviews);
    return l;
  }, [cat, q, currentSort]);

  return (
    <EspressoBackground>
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: ui.background }]}>
        <View style={styles.topRow}>
          <View>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color={ui.secondaryLabel} />
              <Text style={[styles.locationText, { color: ui.secondaryLabel }]}>
                Delivering to Surulere, Lagos
              </Text>
            </View>
            <Text style={[styles.title, { color: ui.label }]}>Market</Text>
          </View>
          <PressableScale
            haptic="light"
            scaleTo={0.9}
            hitSlop={6}
            onPress={() => router.push('/cart' as never)}
            style={[styles.cartCircle, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            <Ionicons name="bag-handle-outline" size={18} color={ui.label} />
            {cartCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: ui.coral }]}>
                <Text style={[styles.badgeText, { color: ui.coralForeground }]}>
                  {cartCount}
                </Text>
              </View>
            ) : null}
          </PressableScale>
        </View>

        {/* Search Input Bar */}
        <View style={[styles.searchBar, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <Ionicons name="search" size={16} color={ui.secondaryLabel} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search sneakers, ankara, skincare…"
            placeholderTextColor={ui.secondaryLabel}
            style={[styles.searchInput, { color: ui.label }]}
          />
          <PressableScale haptic="light" onPress={cycleSort}>
            <Ionicons name="options-outline" size={18} color={ui.secondaryLabel} />
          </PressableScale>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Weekend Drop Promo Card (only when not searching) */}
        {!q ? (
          <View style={styles.promoWrap}>
            <LinearGradient
              colors={[ui.ink, '#091510']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.promoCard, { borderColor: 'rgba(200, 255, 59, 0.25)' }]}>
              <View style={styles.promoLeft}>
                <View style={[styles.promoPill, { backgroundColor: ui.lime }]}>
                  <Text style={[styles.promoPillText, { color: ui.limeForeground }]}>
                    Weekend drop
                  </Text>
                </View>
                <Text style={[styles.promoTitle, { color: ui.inkForeground }]}>
                  Up to 30% off beauty & sneakers
                </Text>
                <View style={styles.promoMetaRow}>
                  <Ionicons name="bicycle-outline" size={14} color={ui.inkMuted} />
                  <Text style={[styles.promoMetaText, { color: ui.inkMuted }]}>
                    Free pickup from sellers near you
                  </Text>
                </View>
                <PressableScale
                  haptic="light"
                  scaleTo={0.97}
                  onPress={() => setCat('all')}
                  style={styles.shopDropBtn}>
                  <Text style={[styles.shopDropText, { color: ui.lime }]}>
                    Shop the drop
                  </Text>
                  <Ionicons name="arrow-forward" size={15} color={ui.lime} />
                </PressableScale>
              </View>
              {products[0] ? (
                <View style={styles.promoImageWrap}>
                  <Image
                    source={products[0].image}
                    style={styles.promoImage}
                    contentFit="cover"
                  />
                </View>
              ) : null}
            </LinearGradient>
          </View>
        ) : null}

        {/* Emoji Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {categories.map((c) => {
            const isSelected = cat === c.id;
            return (
              <PressableScale
                key={c.id}
                haptic="selection"
                scaleTo={0.94}
                onPress={() => setCat(c.id)}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? { backgroundColor: ui.label }
                    : { backgroundColor: ui.card, borderColor: ui.separator, borderWidth: StyleSheet.hairlineWidth },
                ]}>
                <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isSelected ? ui.background : ui.secondaryLabel },
                  ]}>
                  {c.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Top Vendors Near You (only when not searching & cat === 'all') */}
        {!q && cat === 'all' ? (
          <View style={styles.vendorsSection}>
            <Text style={[styles.sectionTitle, { color: ui.label }]}>
              Top vendors near you
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.vendorsScroll}>
              {vendors.map((v) => {
                const owner = getPerson(v.ownerHandle);
                return (
                  <PressableScale
                    key={v.id}
                    haptic="light"
                    scaleTo={0.97}
                    onPress={() => router.push(`/u/${v.ownerHandle}` as never)}
                    style={[
                      styles.vendorCard,
                      { backgroundColor: ui.card, borderColor: ui.separator },
                    ]}>
                    <View style={styles.vendorTop}>
                      {owner?.avatar ? (
                        <Image source={owner.avatar} style={styles.vendorAvatar} contentFit="cover" />
                      ) : (
                        <View style={[styles.vendorAvatar, { backgroundColor: ui.cardRaised, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={[styles.vendorInitials, { color: ui.label }]}>
                            {v.name.charAt(0)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.vendorInfo}>
                        <View style={styles.vendorNameRow}>
                          <Text style={[styles.vendorName, { color: ui.label }]} numberOfLines={1}>
                            {v.name}
                          </Text>
                          <Ionicons name="checkmark-circle" size={13} color={ui.accent} />
                        </View>
                        <Text style={[styles.vendorLocation, { color: ui.secondaryLabel }]} numberOfLines={1}>
                          {v.location}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.vendorBottom}>
                      <View style={styles.vendorStarRow}>
                        <Ionicons name="star" size={11} color="#F5B82E" />
                        <Text style={[styles.vendorRating, { color: ui.label }]}>{v.rating}</Text>
                      </View>
                      <Text style={[styles.vendorSales, { color: ui.secondaryLabel }]}>
                        {v.sales.toLocaleString()} sales
                      </Text>
                      <Text style={[styles.vendorResponse, { color: ui.secondaryLabel }]}>
                        Replies {v.responseTime}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Fresh Finds 2-Column Product Grid */}
        <View style={styles.gridSection}>
          <View style={styles.gridHeader}>
            <Text style={[styles.sectionTitle, { color: ui.label }]}>
              {q ? `Results for “${q}”` : 'Fresh finds'}
            </Text>
            <PressableScale
              haptic="selection"
              onPress={cycleSort}
              style={[styles.sortPill, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Text style={[styles.sortText, { color: ui.label }]}>{currentSort}</Text>
              <Ionicons name="chevron-down" size={12} color={ui.secondaryLabel} />
            </PressableScale>
          </View>

          {list.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={32} color={ui.secondaryLabel} />
              <Text style={[styles.emptyTitle, { color: ui.label }]}>Nothing here yet</Text>
              <Text style={[styles.emptySubtitle, { color: ui.secondaryLabel }]}>
                Try another word or category — new vendors join every day.
              </Text>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {list.map((prod) => (
                <View key={prod.id} style={styles.gridColumn}>
                  <ProductCard product={prod} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  title: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 28,
    marginTop: 2,
  },
  cartCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    ...continuous,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  promoWrap: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  promoCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...continuous,
  },
  promoLeft: {
    flex: 1,
    gap: 6,
  },
  promoPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  promoPillText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
  },
  promoTitle: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 20,
    lineHeight: 24,
    marginTop: 2,
  },
  promoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promoMetaText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  shopDropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  shopDropText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  promoImageWrap: {
    width: 90,
    height: 90,
    transform: [{ rotate: '-12deg' }],
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: 8,
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  vendorsSection: {
    marginTop: 20,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    paddingHorizontal: 20,
  },
  vendorsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  vendorCard: {
    width: 210,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    ...continuous,
  },
  vendorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vendorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  vendorInitials: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 15,
  },
  vendorInfo: {
    flex: 1,
    gap: 2,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorName: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  vendorLocation: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 11,
  },
  vendorBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  vendorStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  vendorRating: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
  },
  vendorSales: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 11,
  },
  vendorResponse: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 10,
  },
  gridSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 14,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sortText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  gridColumn: {
    width: '48%',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
  },
  emptySubtitle: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
});
