import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useEngagement, useIsFollowing } from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const BANNER = require('@/assets/figma/store-banner.png');
const AVATAR = require('@/assets/figma/store-avatar.png');

const TABS = ['Posts', 'Following', 'Followers'] as const;
const CHIPS = ['Shoes', "Women's fashion", 'Beauty', 'Bags'];

const PRODUCTS = Array.from({ length: 6 }).map((_, i) => ({
  id: `vp-${i}`,
  name: i % 2 ? 'Ankara high shoulder fitted gown' : 'Little Gold and green peplum kimo gown',
  price: i % 2 ? '₦24,990' : '₦44,990',
  oldPrice: '₦46,990',
}));

export default function VendorStoreScreen() {
  const [tab, setTab] = useState<typeof TABS[number]>('Posts');
  const isFollowing = useIsFollowing('sarahs-boutique');
  const toggleFollow = useEngagement((s) => s.toggleFollow);

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
          <Image source={BANNER} style={styles.banner} contentFit="cover" />
          <View style={styles.profileBlock}>
            <View style={styles.avatarRing}>
              <Avatar size={84} source={AVATAR} />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.storeName}>Sarah&apos;s Boutique</Text>
              <VerifiedCheck tone="success" size={16} />
            </View>
            <View style={styles.starRow}>
              <Ionicons name="star" size={14} color={palette.brand.amber} />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.reviewsCount}>(134 Reviews)</Text>
            </View>
            <View style={styles.followActions}>
              <Pressable
                onPress={() => toggleFollow('sarahs-boutique')}
                style={({ pressed }) => [
                  styles.followBtn,
                  isFollowing ? styles.followingBtn : styles.notFollowing,
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={[styles.followLabel, isFollowing && styles.followingLabel]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.msgBtn, pressed && { opacity: 0.85 }]}>
                <Ionicons name="chatbubble-outline" size={16} color={palette.ink.onDarkStrong} />
                <Text style={styles.msgLabel}>Message</Text>
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
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            {CHIPS.map((c, idx) => (
              <Pressable
                key={c}
                style={[styles.chip, idx === 0 && styles.chipActive]}>
                <Text style={[styles.chipText, idx === 0 && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.grid}>
            {PRODUCTS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/product/${p.id}` as never)}
                style={styles.tile}>
                <Image source={PRODUCT_IMAGE} style={styles.tileImage} contentFit="cover" />
                <Text style={styles.tileName} numberOfLines={2}>{p.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.tilePrice}>{p.price}</Text>
                  <Text style={styles.tileOldPrice}>{p.oldPrice}</Text>
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
    backgroundColor: 'rgba(20,12,8,0.55)',
    zIndex: 5,
  },
  backBtn: { left: 16 },
  shareBtn: { right: 16 },
  scroll: { paddingBottom: 100 },
  banner: { height: 160 },
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
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
    borderBottomColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
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
  tile: { width: '48%', gap: 4 },
  tileImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
