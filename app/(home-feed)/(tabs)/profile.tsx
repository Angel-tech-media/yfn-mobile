import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useCartCount } from '@/src/store/cart';
import { useUser } from '@/src/store/user';
import { useWishlistCount } from '@/src/store/wishlist';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const STORE_BANNER = require('@/assets/figma/store-banner.png');
const STORE_AVATAR = require('@/assets/figma/store-avatar.png');

export default function ProfileTabScreen() {
  const role = useUser((s) => s.role);
  const toggleRole = useUser((s) => s.toggleRole);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{role === 'vendor' ? 'My Store' : 'Account'}</Text>
          <View style={styles.headerRight}>
            <Pressable hitSlop={8} onPress={() => router.push('/settings')} style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={20} color={palette.ink.onDarkStrong} />
            </Pressable>
          </View>
        </View>

        <View style={styles.modeWrap}>
          <View style={styles.modeToggle}>
            <Pressable
              onPress={() => role !== 'buyer' && toggleRole()}
              style={[styles.modeOption, role === 'buyer' && styles.modeOptionActive]}>
              <Ionicons name="person-outline" size={14} color={role === 'buyer' ? palette.ink.onLightStrong : palette.ink.onDarkSoft} />
              <Text style={[styles.modeLabel, role === 'buyer' && styles.modeLabelActive]}>Buyer</Text>
            </Pressable>
            <Pressable
              onPress={() => role !== 'vendor' && toggleRole()}
              style={[styles.modeOption, role === 'vendor' && styles.modeOptionActive]}>
              <Ionicons name="storefront-outline" size={14} color={role === 'vendor' ? palette.ink.onLightStrong : palette.ink.onDarkSoft} />
              <Text style={[styles.modeLabel, role === 'vendor' && styles.modeLabelActive]}>Vendor</Text>
            </Pressable>
          </View>
        </View>

        {role === 'buyer' ? <BuyerView /> : <VendorView />}
      </SafeAreaView>
    </EspressoBackground>
  );
}

function BuyerView() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.idCard}>
        <Avatar size={56} initials="DO" />
        <View style={styles.idText}>
          <Text style={styles.name}>David Okpo</Text>
          <Text style={styles.email}>davidokpo7@gmail.com</Text>
        </View>
        <Pressable onPress={() => router.push('/account/edit')} hitSlop={8} style={styles.editBtn}>
          <Ionicons name="pencil" size={14} color={palette.ink.onDarkStrong} />
        </Pressable>
      </View>

      <View style={styles.actionGrid}>
        <ActionTile icon="cube-outline" label="Orders" hint="12" onPress={() => router.push('/orders')} />
        <ActionTile icon="bag-outline" label="Cart" hint={cartCount ? String(cartCount) : undefined} onPress={() => router.push('/cart')} />
        <ActionTile icon="heart-outline" label="Wishlist" hint={wishlistCount ? String(wishlistCount) : undefined} onPress={() => router.push('/wishlist')} />
        <ActionTile icon="notifications-outline" label="Alerts" onPress={() => router.push('/notifications')} />
      </View>

      <Pressable
        onPress={() => router.push('/intent')}
        style={({ pressed }) => [styles.vendorCTA, pressed && { opacity: 0.85 }]}>
        <View style={styles.vendorIcon}>
          <Ionicons name="storefront" size={20} color={palette.ink.onDarkStrong} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.vendorTitle}>Become a vendor</Text>
          <Text style={styles.vendorSubtitle}>Open your store and start selling on Vibe</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={palette.brand.orange} />
      </Pressable>

      <Text style={styles.sectionTitle}>Account</Text>
      <RowGroup
        rows={[
          { key: 'addresses', icon: 'location-outline', label: 'Saved addresses', href: '/account/addresses' },
          { key: 'payments', icon: 'card-outline', label: 'Payment methods', href: '/account/payment-methods' },
        ]}
      />

      <Text style={styles.sectionTitle}>Preferences</Text>
      <RowGroup
        rows={[
          { key: 'notif', icon: 'notifications-outline', label: 'Notifications', href: '/settings/notifications' },
          { key: 'privacy', icon: 'shield-checkmark-outline', label: 'Privacy', href: '/settings/privacy' },
          { key: 'help', icon: 'help-circle-outline', label: 'Help & support', href: '/help' },
        ]}
      />

      <View style={styles.signOutWrap}>
        <Pressable onPress={() => router.replace('/login')} style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name="log-out-outline" size={16} color={palette.status.danger} />
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function VendorView() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.vendorScroll}>
      <View style={styles.bannerWrap}>
        <Image source={STORE_BANNER} style={styles.banner} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(22,9,3,0.95)']}
          style={[StyleSheet.absoluteFill, { top: '50%' }]}
        />
        <View style={styles.bannerActions}>
          <Pressable onPress={() => router.push('/vendor-store-setup/store-details' as never)} style={styles.bannerEditBtn} hitSlop={8}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
            <Text style={styles.bannerEditLabel}>Edit cover</Text>
          </Pressable>
        </View>
        <View style={styles.avatarRing}>
          <Avatar size={88} source={STORE_AVATAR} />
        </View>
      </View>

      <View style={styles.storeIdBlock}>
        <View style={styles.storeNameRow}>
          <Text style={styles.storeName}>Sarah&apos;s Boutique</Text>
          <VerifiedCheck tone="success" size={16} />
        </View>
        <Text style={styles.storeHandle}>@sarahsboutique · Lagos</Text>
        <View style={styles.starRow}>
          <Ionicons name="star" size={14} color={palette.brand.amber} />
          <Text style={styles.rating}>4.8</Text>
          <Text style={styles.reviewsCount}>(134 Reviews)</Text>
        </View>
      </View>

      <View style={styles.storeStatsRow}>
        <StoreStat value="247" label="Posts" />
        <StoreStat value="1.2K" label="Followers" />
        <StoreStat value="318" label="Following" />
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
        <Pressable onPress={() => router.push('/vendor-store-setup/store-details' as never)} style={[styles.vendorBtn, styles.vendorBtnGhost, styles.vendorBtnSquare]}>
          <Ionicons name="pencil" size={16} color={palette.ink.onDarkStrong} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={palette.ink.onDarkSoft} />
        <TextInput
          placeholder="Search products"
          placeholderTextColor={palette.ink.onDarkMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.tabs}>
        {(['Posts', 'Products', 'Reels'] as const).map((t, i) => (
          <View key={t} style={styles.tab}>
            <Text style={[styles.tabLabel, i === 0 && styles.tabActive]}>{t}</Text>
            {i === 0 ? <View style={styles.tabIndicator} /> : null}
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Pressable
            key={i}
            onPress={() => router.push(`/product/p${i}` as never)}
            style={styles.tile}>
            <Image source={PRODUCT_IMAGE} style={styles.tileImage} contentFit="cover" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function ActionTile({ icon, label, hint, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionTile, pressed && { opacity: 0.85 }]}>
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={20} color={palette.ink.onDarkStrong} />
        {hint ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{hint}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function RowGroup({
  rows,
}: {
  rows: Array<{ key: string; icon: keyof typeof Ionicons.glyphMap; label: string; href?: string }>;
}) {
  return (
    <View style={styles.rowGroup}>
      {rows.map((r, i) => (
        <Pressable
          key={r.key}
          onPress={() => r.href && router.push(r.href as never)}
          style={({ pressed }) => [styles.row, i < rows.length - 1 && styles.rowDivider, pressed && { opacity: 0.85 }]}>
          <Ionicons name={r.icon} size={18} color={palette.ink.onDarkSoft} />
          <Text style={styles.rowLabel}>{r.label}</Text>
          <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
        </Pressable>
      ))}
    </View>
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
  headerRight: { flexDirection: 'row', gap: spacing['2'] },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modeWrap: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['3'],
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modeOptionActive: {
    backgroundColor: palette.bg.surface,
  },
  modeLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  modeLabelActive: { color: palette.ink.onLightStrong },

  // Buyer view
  scroll: { paddingHorizontal: spacing['5'], paddingBottom: 100, gap: spacing['3'] },
  idCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  idText: { flex: 1, gap: 2 },
  name: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    color: palette.ink.onDarkStrong,
  },
  email: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing['2'],
    justifyContent: 'space-between',
  },
  actionTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIconWrap: { position: 'relative' },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    color: '#FFFFFF',
  },
  actionLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  vendorCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(253,134,22,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(253,134,22,0.40)',
  },
  vendorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(253,134,22,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  vendorSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: palette.ink.onDarkMuted,
    marginTop: spacing['3'],
  },
  rowGroup: {
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    height: 52,
    paddingHorizontal: spacing['4'],
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLabel: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  signOutWrap: {
    paddingTop: spacing['4'],
    alignItems: 'center',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,61,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,61,0,0.30)',
  },
  signOutLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.status.danger,
  },

  // Vendor view
  vendorScroll: { paddingBottom: 100 },
  bannerWrap: { position: 'relative' },
  banner: { width: '100%', height: 160 },
  bannerActions: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bannerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    backgroundColor: palette.bg.espressoEnd,
  },
  storeIdBlock: {
    paddingTop: 52,
    paddingHorizontal: spacing['5'],
    gap: 4,
  },
  storeNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  storeName: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: palette.ink.onDarkStrong,
  },
  storeHandle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
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
  storeStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
    gap: spacing['4'],
  },
  storeStat: { gap: 2 },
  storeStatValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  storeStatLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  vendorActions: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
  },
  vendorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
  },
  vendorBtnPrimary: {
    flex: 1,
    backgroundColor: palette.brand.orange,
  },
  vendorBtnGhost: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  vendorBtnSquare: { flex: 0, width: 40, paddingHorizontal: 0 },
  vendorBtnLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  vendorBtnLabelGhost: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    height: 40,
    marginHorizontal: spacing['5'],
    marginTop: spacing['3'],
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    marginTop: spacing['3'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing['3'],
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  tabActive: { color: palette.ink.onDarkStrong },
  tabIndicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.brand.orange,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 2,
  },
  tile: {
    width: '33.2%',
    aspectRatio: 1,
  },
  tileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
