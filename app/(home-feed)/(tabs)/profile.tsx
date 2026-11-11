import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProfileTabContent } from '@/components/ui/ProfileTabContent';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useMe } from '@/src/api/account/hooks';
import { useMyRepostedPosts } from '@/src/api/feed/hooks';
import { useMyReposts } from '@/src/api/reposts/hooks';
import { useUserPosts, useVendor, useVendorProducts } from '@/src/api/vendors/hooks';
import { useCartCount } from '@/src/store/cart';
import { useTheme } from '@/src/store/theme';
import { useWishlistCount } from '@/src/store/wishlist';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

export default function ProfileTabScreen() {
  const ui = useUi();
  const { data: me, isLoading } = useMe();
  const hasStore = Boolean(me?.hasStore || me?.role === 'vendor');

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={ui.accent} />
            <Text style={[type.subhead, { color: ui.secondaryLabel, marginTop: 8 }]}>Loading profile...</Text>
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
  const ui = useUi();
  const themeMode = useTheme((s) => s.mode);
  const setThemeMode = useTheme((s) => s.setMode);
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
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Deep Forest Ink Cover Banner */}
      <View style={styles.bannerWrap}>
        <LinearGradient
          colors={ui.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        />
        <View style={styles.bannerTopActions}>
          <PressableScale
            haptic="light"
            onPress={() => router.push('/settings' as never)}
            style={styles.bannerActionCircle}
            accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={18} color="#F4F2E8" />
          </PressableScale>
        </View>
      </View>

      <View style={styles.paddedBody}>
        {/* Overlapping Avatar + Edit Profile Row */}
        <View style={styles.avatarOverlapRow}>
          <View style={[styles.avatarRing, { backgroundColor: ui.background, borderColor: ui.background }]}>
            <Avatar
              size={84}
              source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
              initials={initialsFor(displayName)}
            />
          </View>
          <PressableScale
            haptic="light"
            onPress={() => router.push('/account/edit' as never)}
            style={[styles.editPill, { backgroundColor: ui.card, borderColor: ui.separator }]}>
            <Text style={[styles.editPillText, { color: ui.label }]}>Edit profile</Text>
          </PressableScale>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={[styles.displayName, { color: ui.label }]}>{displayName}</Text>
            {me?.kycVerified ? <Ionicons name="checkmark-circle" size={18} color={ui.accent} /> : null}
          </View>
          <Text style={[type.footnote, { color: ui.secondaryLabel }]}>@{handle}</Text>
          {me?.bio ? (
            <Text style={[type.subhead, { color: ui.label, marginTop: 6, lineHeight: 20 }]}>{me.bio}</Text>
          ) : null}
        </View>

        {/* Stats 3-Column Card */}
        <View style={[styles.statsCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <StatColumn value={String(userPosts.length)} label="Posts" />
          <View style={[styles.statDivider, { backgroundColor: ui.separator }]} />
          <StatColumn value={String(reposts.length)} label="Reposts" />
          <View style={[styles.statDivider, { backgroundColor: ui.separator }]} />
          <StatColumn value={String(wishlistCount)} label="Wishlist" onPress={() => router.push('/wishlist' as never)} />
        </View>

        {/* Lovable Electric Lime Store CTA Banner */}
        <PressableScale
          haptic="medium"
          scaleTo={0.985}
          onPress={() => router.push('/vendor-verify' as never)}
          style={[styles.limeCtaCard, { backgroundColor: ui.lime }]}>
          <View style={[styles.limeCtaIcon, { backgroundColor: ui.ink }]}>
            <Ionicons name="storefront-outline" size={20} color={ui.lime} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.limeCtaTitle, { color: ui.limeForeground }]}>
              Turn your hustle into a store
            </Text>
            <Text style={[styles.limeCtaSub, { color: ui.limeForeground }]}>
              Get verified, list products & receive escrow payouts
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={ui.limeForeground} />
        </PressableScale>

        {/* Lovable Menu Card with Night Mode Toggle */}
        <View style={[styles.menuCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <MenuRow
            icon="bag-handle-outline"
            label="My orders"
            badge={cartCount ? `${cartCount} in cart` : undefined}
            onPress={() => router.push('/orders' as never)}
          />
          <MenuRow
            icon="heart-outline"
            label="Saved & wishlist"
            badge={wishlistCount ? String(wishlistCount) : undefined}
            onPress={() => router.push('/wishlist' as never)}
          />
          <MenuRow
            icon="wallet-outline"
            label="Wallet & escrow"
            onPress={() => router.push('/(home-feed)/(tabs)/wallet' as never)}
          />
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.menuIconWrap, { backgroundColor: ui.secondary }]}>
              <Ionicons name={ui.isDark ? 'moon' : 'moon-outline'} size={17} color={ui.label} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: ui.label }]}>Lagos Night mode</Text>
              <Text style={[type.caption2, { color: ui.secondaryLabel }]}>
                {ui.isDark ? 'Dark mode active' : 'Warm Lagos Paper light mode'}
              </Text>
            </View>
            <Switch
              value={ui.isDark}
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
              trackColor={{ false: ui.separator, true: ui.accent }}
              thumbColor={ui.isDark ? ui.limeForeground : '#FFFFFF'}
            />
          </View>
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
  const ui = useUi();
  const setThemeMode = useTheme((s) => s.setMode);
  const { data: me } = useMe();
  const { data: vendor } = useVendor(handle);
  const { data: products = [] } = useVendorProducts(handle);
  const { data: userPostsData } = useUserPosts(handle || me?.username);
  const { data: reposts = [] } = useMyReposts();
  const { data: repostedPostsData } = useMyRepostedPosts();
  const repostedPosts = repostedPostsData?.items ?? [];
  const userPosts = userPostsData?.items ?? [];
  const name = vendor?.storeName || me?.name || me?.displayName || 'Store';
  const avatarName = vendor?.name || name;
  const bannerUrl = vendor?.photos?.[0];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.bannerWrap}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.banner} contentFit="cover" />
        ) : (
          <LinearGradient
            colors={ui.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          />
        )}
        <View style={styles.bannerTopActions}>
          <PressableScale
            haptic="light"
            onPress={() => router.push('/vendor-store-setup/store-details' as never)}
            style={styles.bannerEditBtn}>
            <Ionicons name="camera" size={14} color="#F4F2E8" />
            <Text style={styles.bannerEditLabel}>Edit cover</Text>
          </PressableScale>
          <PressableScale
            haptic="light"
            onPress={() => router.push('/settings' as never)}
            style={styles.bannerActionCircle}
            accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={18} color="#F4F2E8" />
          </PressableScale>
        </View>
      </View>

      <View style={styles.paddedBody}>
        <View style={styles.avatarOverlapRow}>
          <View style={[styles.avatarRing, { backgroundColor: ui.background, borderColor: ui.background }]}>
            <Avatar
              size={84}
              source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
              initials={initialsFor(avatarName)}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PressableScale
              haptic="light"
              onPress={() => router.push('/vendor-dashboard' as never)}
              style={[styles.editPill, { backgroundColor: ui.ink, borderColor: ui.ink }]}>
              <Text style={[styles.editPillText, { color: ui.inkForeground }]}>Dashboard</Text>
            </PressableScale>
            <PressableScale
              haptic="light"
              onPress={() => router.push('/products/add' as never)}
              style={[styles.editPill, { backgroundColor: ui.lime, borderColor: ui.lime }]}>
              <Text style={[styles.editPillText, { color: ui.limeForeground }]}>+ Add Drop</Text>
            </PressableScale>
          </View>
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={[styles.displayName, { color: ui.label }]}>{name}</Text>
            {vendor?.verified ? <VerifiedCheck tone="success" size={16} /> : null}
          </View>
          <Text style={[type.footnote, { color: ui.secondaryLabel }]}>@{handle || me?.username || 'store'}</Text>
          {vendor?.about ? (
            <Text style={[type.subhead, { color: ui.label, marginTop: 6, lineHeight: 20 }]}>{vendor.about}</Text>
          ) : null}
        </View>

        <View style={[styles.statsCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <StatColumn value={String(vendor?.posts ?? products.length)} label="Drops" />
          <View style={[styles.statDivider, { backgroundColor: ui.separator }]} />
          <StatColumn value={compact(vendor?.followers ?? 0)} label="Followers" />
          <View style={[styles.statDivider, { backgroundColor: ui.separator }]} />
          <StatColumn value={compact(vendor?.following ?? 0)} label="Following" />
        </View>

        {/* Night mode quick toggle */}
        <View style={[styles.menuCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.menuIconWrap, { backgroundColor: ui.secondary }]}>
              <Ionicons name={ui.isDark ? 'moon' : 'moon-outline'} size={17} color={ui.label} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: ui.label }]}>Lagos Night mode</Text>
              <Text style={[type.caption2, { color: ui.secondaryLabel }]}>
                {ui.isDark ? 'Dark mode active' : 'Warm Lagos Paper light mode'}
              </Text>
            </View>
            <Switch
              value={ui.isDark}
              onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
              trackColor={{ false: ui.separator, true: ui.accent }}
              thumbColor={ui.isDark ? ui.limeForeground : '#FFFFFF'}
            />
          </View>
        </View>
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
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'A'
  );
}

function StatColumn({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  const ui = useUi();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.statColumn}>
      <Text style={[styles.statValue, { color: ui.label }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: ui.secondaryLabel }]}>{label}</Text>
    </Pressable>
  );
}

function MenuRow({
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
  const ui = useUi();
  return (
    <Pressable onPress={onPress} style={[styles.menuItem, { borderBottomColor: ui.separator }]}>
      <View style={[styles.menuIconWrap, { backgroundColor: ui.secondary }]}>
        <Ionicons name={icon} size={17} color={ui.label} />
      </View>
      <Text style={[styles.menuLabel, { color: ui.label, flex: 1 }]}>{label}</Text>
      {badge ? (
        <View style={[styles.menuBadge, { backgroundColor: ui.secondary }]}>
          <Text style={[styles.menuBadgeText, { color: ui.label }]}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={ui.secondaryLabel} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 110 },
  bannerWrap: { position: 'relative' },
  banner: { width: '100%', height: 118 },
  bannerTopActions: {
    position: 'absolute',
    top: 12,
    right: layout.gutter,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerActionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 21, 19, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17, 21, 19, 0.45)',
  },
  bannerEditLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
    color: '#F4F2E8',
  },
  paddedBody: {
    paddingHorizontal: layout.gutter,
  },
  avatarOverlapRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -42,
    marginBottom: 12,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 2,
  },
  editPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: corner.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPillText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  identity: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    marginBottom: 14,
    ...continuous,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
  },
  statValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 11,
  },
  limeCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    ...continuous,
  },
  limeCtaIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limeCtaTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  limeCtaSub: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 1,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 18,
    ...continuous,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  menuBadgeText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
  },
});
