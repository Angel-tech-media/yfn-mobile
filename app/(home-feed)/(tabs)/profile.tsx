import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { ProfileTabContent } from '@/components/ui/ProfileTabContent';
import { useMe } from '@/src/api/account/hooks';
import { useMyRepostedPosts } from '@/src/api/feed/hooks';
import { useMyReposts } from '@/src/api/reposts/hooks';
import { useVendor, useVendorProducts, useVendorReviews, useUserPosts } from '@/src/api/vendors/hooks';
import { useCartCount } from '@/src/store/cart';
import { useWishlistCount } from '@/src/store/wishlist';
import { palette, radius, spacing, typography } from '@/src/theme';

import { formatKobo } from '@/src/utils/money';

import type { Post, RankedProduct, Repost } from '@/src/api/types';

export default function ProfileTabScreen() {
  const { data: me, isLoading } = useMe();
  const hasStore = Boolean(me?.hasStore || me?.role === 'vendor');
  const title = hasStore ? 'My Store' : `@${me?.handle || me?.username || 'profile'}`;

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.headerRight}>
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/settings')}
              style={styles.iconBtn}
              accessibilityLabel="Settings">
              <Ionicons name={hasStore ? 'settings-outline' : 'menu'} size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <Text style={styles.stateText}>Loading profile...</Text>
          </View>
        ) : hasStore ? (
          <VendorView handle={me?.handle || me?.username} />
        ) : (
          <BuyerView />
        )}
      </SafeAreaView>
    </EspressoBackground>
  );
}

function BuyerView() {
  const { data: me } = useMe();
  const { data: reposts = [] } = useMyReposts();
  const { data: repostedPostsData } = useMyRepostedPosts();
  const repostedPosts = repostedPostsData?.items ?? [];
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const displayName = me?.name || me?.displayName || me?.username || 'Profile';
  const handle = me?.handle || me?.username || 'profile';
  
  const { data: userPostsData } = useUserPosts(me?.username);
  const userPosts = userPostsData?.items ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.vendorScroll}>
      <View style={styles.buyerPadded}>
        <View style={styles.profileTop}>
          <Avatar
            size={86}
            source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
            initials={initialsFor(displayName)}
          />
          <View style={styles.statsRow}>
            <StatColumn value={String(reposts.length)} label="Reposts" />
            <StatColumn value={String(cartCount)} label="Cart" />
            <StatColumn value={String(wishlistCount)} label="Wishlist" />
          </View>
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            {me?.kycVerified ? (
              <View style={styles.kycBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#fff" />
                <Text style={styles.kycBadgeText}>YFN Verified</Text>
              </View>
            ) : null}
          </View>
          {me?.bio ? <Text style={styles.bio}>{me.bio}</Text> : null}
          <Text style={styles.bioLink}>vibe.app/u/{handle}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable onPress={() => router.push('/account/edit')} style={styles.button}>
            <Text style={styles.buttonLabel}>Edit profile</Text>
          </Pressable>
          <Pressable style={styles.button}>
            <Text style={styles.buttonLabel}>Share profile</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/vendor-verify' as never)}
            accessibilityLabel="Become a vendor"
            style={styles.iconButton}>
            <Ionicons name="storefront-outline" size={16} color={palette.brand.orange} />
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          <QuickAction icon="cube-outline" label="Orders" onPress={() => router.push('/orders')} />
          <QuickAction
            icon="bag-outline"
            label="Cart"
            badge={cartCount ? String(cartCount) : undefined}
            onPress={() => router.push('/cart')}
          />
          <QuickAction
            icon="heart-outline"
            label="Wishlist"
            badge={wishlistCount ? String(wishlistCount) : undefined}
            onPress={() => router.push('/wishlist')}
          />
          <QuickAction icon="wallet-outline" label="Wallet" onPress={() => router.push('/(home-feed)/(tabs)/wallet' as never)} />
        </View>
      </View>

      <ProfileTabContent
        handle={handle}
        posts={userPosts}
        products={[]}
        reposts={reposts}
        repostedPosts={repostedPosts}
        hasStore={false}
      />
    </ScrollView>
  );
}

function VendorView({ handle }: { handle?: string }) {
  const { data: me } = useMe();
  const { data: vendor } = useVendor(handle);
  const { data: products = [] } = useVendorProducts(handle);
  const { data: reviews = [] } = useVendorReviews(handle);
  const { data: userPostsData } = useUserPosts(handle || me?.username);
  const { data: reposts = [] } = useMyReposts();
  const { data: repostedPostsData } = useMyRepostedPosts();
  const repostedPosts = repostedPostsData?.items ?? [];
  const userPosts = userPostsData?.items ?? [];
  const name = vendor?.storeName || me?.name || me?.displayName || 'Store';
  const avatarName = vendor?.name || name;
  const bannerUrl = vendor?.photos?.[0];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.vendorScroll}>
      <View style={styles.bannerWrap}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.banner} contentFit="cover" />
        ) : (
          <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.banner} />
        )}
        <LinearGradient colors={['transparent', 'rgba(22,9,3,0.95)']} style={[StyleSheet.absoluteFill, { top: '50%' }]} />
        <View style={styles.bannerActions}>
          <Pressable onPress={() => router.push('/vendor-store-setup/store-details' as never)} style={styles.bannerEditBtn} hitSlop={8}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
            <Text style={styles.bannerEditLabel}>Edit cover</Text>
          </Pressable>
        </View>
        <View style={styles.avatarRing}>
          <Avatar
            size={88}
            source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
            initials={initialsFor(avatarName)}
          />
        </View>
      </View>

      <View style={styles.storeIdBlock}>
        <View style={styles.storeNameRow}>
          <Text style={styles.storeName}>{name}</Text>
          {vendor?.verified ? <VerifiedCheck tone="success" size={16} /> : null}
        </View>
        <Text style={styles.storeHandle}>@{handle || me?.username || 'store'}</Text>
        {vendor ? (
          <View style={styles.starRow}>
            <Ionicons name="star" size={14} color={palette.brand.amber} />
            <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsCount}>({vendor.reviews} Reviews)</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bioBlock}>
        {vendor?.category ? <Text style={styles.bioLine}>{vendor.category}</Text> : null}
        {vendor?.about ? <Text style={styles.bioText}>{vendor.about}</Text> : null}
        {vendor?.address ? <Text style={styles.bioLink}>{vendor.address}</Text> : null}
      </View>

      <View style={styles.storeStatsRow}>
        <StoreStat value={String(vendor?.posts ?? products.length)} label="Posts" />
        <StoreStat value={compact(vendor?.followers ?? 0)} label="Followers" />
        <StoreStat value={compact(vendor?.following ?? 0)} label="Following" />
      </View>

      <View style={styles.vendorActions}>
        <Pressable onPress={() => router.push('/vendor-dashboard')} style={[styles.vendorBtn, styles.vendorBtnPrimary]}>
          <Ionicons name="stats-chart" size={16} color="#FFFFFF" />
          <Text style={styles.vendorBtnLabel}>Dashboard</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/products/add')} style={[styles.vendorBtn, styles.vendorBtnGhost]}>
          <Ionicons name="add" size={18} color={palette.ink.onDarkStrong} />
          <Text style={styles.vendorBtnLabelGhost}>Add product</Text>
        </Pressable>
      </View>

      <ProfileTabContent
        handle={handle || me?.username || 'store'}
        posts={userPosts}
        products={products}
        reposts={reposts}
        repostedPosts={repostedPosts}
        vendorCategory={vendor?.category}
        hasStore={true}
      />
    </ScrollView>
  );
}





function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

function StatColumn({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.statColumn}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickItem}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={palette.brand.orange} />
        {badge ? (
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function StoreStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.storeStat}>
      <Text style={styles.storeStatValue}>{value}</Text>
      <Text style={styles.storeStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateText: { ...typography.body, color: 'rgba(255, 255, 255, 0.7)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
  },
  title: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerRight: { flexDirection: 'row', gap: spacing['2'] },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  buyerPadded: {
    paddingHorizontal: spacing['5'],
    gap: spacing['3'],
  },
  scroll: { paddingHorizontal: spacing['5'], paddingBottom: 100, gap: spacing['3'] },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: { alignItems: 'center', gap: 2 },
  statValue: { ...typography.h2, color: '#FFFFFF', fontWeight: '700' },
  statLabel: { ...typography.caption, color: 'rgba(255, 255, 255, 0.65)' },
  identity: { gap: spacing['1'] },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  displayName: { ...typography.title, color: '#FFFFFF', fontWeight: '700', fontSize: 18 },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(46, 125, 50, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  kycBadgeText: {
    ...typography.small,
    color: '#81C784',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  bio: { ...typography.body, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 20 },
  bioLink: { ...typography.bodyEmphasis, color: palette.brand.orange, fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: spacing['2'], marginTop: spacing['1'] },
  button: {
    flex: 1,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.28)',
  },
  buttonLabel: { ...typography.bodyEmphasis, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 107, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.35)',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing['2'],
    marginTop: spacing['3'],
  },
  quickItem: { alignItems: 'center', gap: 6, flex: 1 },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.22)',
    position: 'relative',
  },
  quickBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
  quickBadgeText: { ...typography.small, color: '#fff', fontFamily: typography.bodyEmphasis.fontFamily },
  quickLabel: { ...typography.caption, color: 'rgba(255, 255, 255, 0.75)', fontWeight: '500' },

  vendorScroll: { paddingBottom: 100 },
  bannerWrap: { position: 'relative' },
  banner: { width: '100%', height: 160 },
  bannerActions: { position: 'absolute', top: 12, right: 12 },
  bannerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  bannerEditLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
  },
  avatarRing: {
    position: 'absolute',
    bottom: -42,
    left: spacing['5'],
    padding: 3,
    borderRadius: 999,
    backgroundColor: '#0A0603',
    borderWidth: 2,
    borderColor: 'rgba(47, 107, 255, 0.4)',
  },
  storeIdBlock: { paddingTop: 52, paddingHorizontal: spacing['5'], gap: 4 },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  storeName: { ...typography.h2, color: '#FFFFFF' },
  storeHandle: { ...typography.caption, color: 'rgba(255, 255, 255, 0.65)' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { ...typography.bodyEmphasis, color: '#FFFFFF' },
  reviewsCount: { ...typography.caption, color: 'rgba(255, 255, 255, 0.65)' },
  bioBlock: { paddingHorizontal: spacing['5'], paddingTop: spacing['3'], gap: 4 },
  bioLine: { ...typography.bodyEmphasis, color: palette.brand.orange },
  bioText: { ...typography.body, color: 'rgba(255, 255, 255, 0.85)' },
  storeStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
    gap: spacing['4'],
  },
  storeStat: { gap: 2 },
  storeStatValue: { ...typography.h2, color: '#FFFFFF' },
  storeStatLabel: { ...typography.caption, color: 'rgba(255, 255, 255, 0.65)' },
  vendorActions: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
  },
  vendorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
  },
  vendorBtnPrimary: { backgroundColor: palette.brand.orange },
  vendorBtnGhost: {
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.28)',
  },
  vendorBtnLabel: { ...typography.buttonLabel, color: '#FFFFFF', fontSize: 13 },
  vendorBtnLabelGhost: { ...typography.buttonLabel, color: '#FFFFFF', fontSize: 13 },
  padded: { paddingHorizontal: spacing['5'] },
  reviewList: { paddingHorizontal: spacing['5'], paddingTop: spacing['2'], gap: spacing['2'] },
  reviewCard: {
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  reviewAuthor: { ...typography.bodyEmphasis, color: '#FFFFFF' },
  reviewText: { ...typography.body, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 },
});
