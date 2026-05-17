import { useState } from 'react';
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
import { useEngagement } from '@/src/store/engagement';
import { useUser } from '@/src/store/user';
import { useWishlistCount } from '@/src/store/wishlist';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const STORE_BANNER = require('@/assets/figma/store-banner.png');
const STORE_AVATAR = require('@/assets/figma/store-avatar.png');

type OwnPost = {
  id: string;
  kind: 'photo' | 'reel' | 'multi';
  image: any;
  likes: number;
  comments: number;
};

const POST_STORY_1 = require('@/assets/figma/story-1.png');
const POST_STORY_2 = require('@/assets/figma/story-2.png');
const POST_STORY_3 = require('@/assets/figma/story-3.png');
const POST_STORY_4 = require('@/assets/figma/story-4.png');
const POST_STORY_5 = require('@/assets/figma/story-5.png');
const POST_STORY_6 = require('@/assets/figma/story-6.png');
const POST_HERO = require('@/assets/figma/welcome-hero.png');
const POST_REEL = require('@/assets/figma/reel-snowboarder.png');

const OWN_POSTS: OwnPost[] = [
  { id: 'o1', kind: 'multi', image: POST_HERO, likes: 412, comments: 38 },
  { id: 'o2', kind: 'photo', image: POST_STORY_1, likes: 189, comments: 12 },
  { id: 'o3', kind: 'photo', image: POST_STORY_2, likes: 256, comments: 24 },
  { id: 'o4', kind: 'reel', image: POST_REEL, likes: 1124, comments: 87 },
  { id: 'o5', kind: 'photo', image: POST_STORY_3, likes: 142, comments: 8 },
  { id: 'o6', kind: 'photo', image: POST_STORY_4, likes: 312, comments: 19 },
  { id: 'o7', kind: 'reel', image: PRODUCT_IMAGE, likes: 642, comments: 47 },
  { id: 'o8', kind: 'multi', image: POST_STORY_5, likes: 218, comments: 14 },
  { id: 'o9', kind: 'photo', image: POST_STORY_6, likes: 167, comments: 9 },
  { id: 'o10', kind: 'photo', image: POST_STORY_1, likes: 84, comments: 5 },
  { id: 'o11', kind: 'reel', image: POST_STORY_2, likes: 532, comments: 38 },
  { id: 'o12', kind: 'photo', image: POST_STORY_3, likes: 201, comments: 16 },
];

export default function ProfileTabScreen() {
  const role = useUser((s) => s.role);
  const isBuyer = role === 'buyer';

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isBuyer ? '@davidokpo' : 'My Store'}
          </Text>
          <View style={styles.headerRight}>
            {isBuyer ? (
              <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="Notifications">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={palette.ink.onDarkStrong}
                />
              </Pressable>
            ) : null}
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/settings')}
              style={styles.iconBtn}
              accessibilityLabel="Settings">
              <Ionicons
                name={isBuyer ? 'menu' : 'settings-outline'}
                size={20}
                color={palette.ink.onDarkStrong}
              />
            </Pressable>
          </View>
        </View>

        {isBuyer ? <BuyerView /> : <VendorView />}
      </SafeAreaView>
    </EspressoBackground>
  );
}

function BuyerView() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const [tab, setTab] = useState<'posts' | 'reels' | 'reposts'>('posts');
  const repostMap = useEngagement((s) => s.reposts);
  const reposts = Object.values(repostMap);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={instaStyles.scroll}>
      {/* Avatar + stats row */}
      <View style={instaStyles.topRow}>
        <View style={instaStyles.avatarRing}>
          <Avatar size={84} initials="DO" />
        </View>
        <View style={instaStyles.statsRow}>
          <StatColumn value="48" label="Posts" />
          <StatColumn value="312" label="Followers" />
          <StatColumn value="284" label="Following" />
        </View>
      </View>

      {/* Identity block */}
      <View style={instaStyles.identity}>
        <View style={instaStyles.nameRow}>
          <Text style={instaStyles.displayName}>David Okpo</Text>
          <View style={instaStyles.kycBadge}>
            <Ionicons name="shield-checkmark" size={10} color="#fff" />
            <Text style={instaStyles.kycBadgeText}>YFN Verified</Text>
          </View>
        </View>
        <Text style={instaStyles.bio}>
          Lagos · finding good food, good cake, good books{'\n'}KYC-verified buyer on Vibe
        </Text>
        <Pressable hitSlop={6}>
          <Text style={instaStyles.bioLink}>vibe.app/u/davidokpo</Text>
        </Pressable>
      </View>

      {/* Action buttons row */}
      <View style={instaStyles.buttonRow}>
        <Pressable
          onPress={() => router.push('/account/edit')}
          style={({ pressed }) => [instaStyles.button, pressed && { opacity: 0.85 }]}>
          <Text style={instaStyles.buttonLabel}>Edit profile</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [instaStyles.button, pressed && { opacity: 0.85 }]}>
          <Text style={instaStyles.buttonLabel}>Share profile</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/vendor-verify' as never)}
          accessibilityLabel="Become a vendor"
          style={({ pressed }) => [instaStyles.iconButton, pressed && { opacity: 0.85 }]}>
          <Ionicons name="storefront-outline" size={16} color={palette.brand.orange} />
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={instaStyles.quickRow}>
        <QuickAction
          icon="cube-outline"
          label="Orders"
          badge="12"
          onPress={() => router.push('/orders')}
        />
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
        <QuickAction
          icon="wallet-outline"
          label="Wallet"
          onPress={() => router.push('/(tabs)/wallet' as never)}
        />
      </View>

      {/* Tab strip — Instagram style with Reposts */}
      <View style={instaStyles.iconTabs}>
        <Pressable
          onPress={() => setTab('posts')}
          style={[instaStyles.iconTab, tab === 'posts' && instaStyles.iconTabActive]}>
          <Ionicons
            name="grid-outline"
            size={20}
            color={tab === 'posts' ? palette.ink.onDarkStrong : palette.ink.onDarkMuted}
          />
        </Pressable>
        <Pressable
          onPress={() => setTab('reels')}
          style={[instaStyles.iconTab, tab === 'reels' && instaStyles.iconTabActive]}>
          <Ionicons
            name="play-outline"
            size={20}
            color={tab === 'reels' ? palette.ink.onDarkStrong : palette.ink.onDarkMuted}
          />
        </Pressable>
        <Pressable
          onPress={() => setTab('reposts')}
          style={[instaStyles.iconTab, tab === 'reposts' && instaStyles.iconTabActive]}>
          <Ionicons
            name="repeat"
            size={20}
            color={tab === 'reposts' ? palette.brand.orange : palette.ink.onDarkMuted}
          />
          {reposts.length > 0 ? (
            <View style={instaStyles.tabBadge}>
              <Text style={instaStyles.tabBadgeText}>{reposts.length}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {tab === 'reposts' ? (
        reposts.length === 0 ? (
          <View style={instaStyles.empty}>
            <Ionicons name="repeat" size={32} color={palette.ink.onDarkMuted} />
            <Text style={instaStyles.emptyTitle}>No reposts yet</Text>
            <Text style={instaStyles.emptyText}>
              Tap the repeat icon on any product you love. Earn ₦50 every time someone buys through you.
            </Text>
          </View>
        ) : (
          <View style={instaStyles.grid}>
            {reposts.map((r) => (
              <Pressable
                key={r.productId}
                onPress={() => router.push(`/product/${r.productId}?via=davidokpo` as never)}
                style={instaStyles.tile}>
                <Image source={PRODUCT_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.65)']}
                  locations={[0.45, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[instaStyles.tileBadge, { backgroundColor: palette.brand.orange }]}>
                  <Ionicons name="repeat" size={11} color="#fff" />
                </View>
                <View style={instaStyles.tileVendor}>
                  <Text style={instaStyles.tileVendorText} numberOfLines={1}>
                    @{r.vendorId}
                  </Text>
                  <Text style={instaStyles.tileEarning}>+₦{r.earningsNgn}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )
      ) : (
        <View style={instaStyles.grid}>
          {(tab === 'reels' ? OWN_POSTS.filter((p) => p.kind === 'reel') : OWN_POSTS).map(
            (p, i) => (
              <Pressable key={p.id} style={instaStyles.tile}>
                <Image source={p.image} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(255, 255, 255, 0.55)']}
                  locations={[0.55, 1]}
                  style={StyleSheet.absoluteFill}
                />
                {p.kind === 'reel' ? (
                  <View style={instaStyles.tileBadge}>
                    <Ionicons name="play" size={12} color="#fff" />
                  </View>
                ) : p.kind === 'multi' ? (
                  <View style={instaStyles.tileBadge}>
                    <Ionicons name="copy-outline" size={12} color="#fff" />
                  </View>
                ) : null}
                {i === 0 && tab === 'posts' ? (
                  <View style={instaStyles.tilePinned}>
                    <Ionicons name="pin" size={10} color="#fff" />
                  </View>
                ) : null}
                <View style={instaStyles.tileStats}>
                  <View style={instaStyles.tileStat}>
                    <Ionicons name="heart" size={10} color="#fff" />
                    <Text style={instaStyles.tileStatText}>{compact(p.likes)}</Text>
                  </View>
                  <View style={instaStyles.tileStat}>
                    <Ionicons name="chatbubble" size={10} color="#fff" />
                    <Text style={instaStyles.tileStatText}>{compact(p.comments)}</Text>
                  </View>
                </View>
              </Pressable>
            ),
          )}
        </View>
      )}
    </ScrollView>
  );
}

function compact(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return String(n);
}

function StatColumn({ value, label }: { value: string; label: string }) {
  return (
    <View style={instaStyles.statColumn}>
      <Text style={instaStyles.statValue}>{value}</Text>
      <Text style={instaStyles.statLabel}>{label}</Text>
    </View>
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [instaStyles.quickItem, pressed && { opacity: 0.85 }]}>
      <View style={instaStyles.quickIcon}>
        <Ionicons name={icon} size={18} color={palette.ink.onDarkStrong} />
        {badge ? (
          <View style={instaStyles.quickBadge}>
            <Text style={instaStyles.quickBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={instaStyles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const VENDOR_CATEGORIES = ['All', 'Dresses', 'Gowns', 'Suits', 'Bags', 'Shoes'];

function VendorView() {
  const [activeCategory, setActiveCategory] = useState('All');

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

      <View style={styles.bioBlock}>
        <Text style={styles.bioLine}>Bespoke fashion · NIN-verified · Lagos</Text>
        <Text style={styles.bioText}>
          Custom Ankara, lace gowns & corporate two-pieces. Same-day fittings on
          weekdays. DM for collaborations.
        </Text>
        <Pressable hitSlop={6}>
          <Text style={styles.bioLink}>linktr.ee/sarahsboutique</Text>
        </Pressable>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}>
        {VENDOR_CATEGORIES.map((c) => {
          const on = activeCategory === c;
          return (
            <Pressable
              key={c}
              onPress={() => setActiveCategory(c)}
              style={[styles.categoryChip, on && styles.categoryChipOn]}>
              <Text style={[styles.categoryLabel, on && styles.categoryLabelOn]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {VENDOR_GRID.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/product/${p.id}` as never)}
            style={styles.tile}>
            <Image source={p.image} style={styles.tileImage} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              locations={[0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tileMeta}>
              <Text style={styles.tilePrice}>{p.price}</Text>
              <Text style={styles.tileCategory} numberOfLines={1}>
                {p.category}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const VENDOR_GRID = [
  { id: 'p1', category: 'Dresses', price: '₦24,990', image: POST_HERO },
  { id: 'p2', category: 'Gowns', price: '₦42,000', image: POST_STORY_1 },
  { id: 'p3', category: 'Suits', price: '₦27,000', image: POST_STORY_2 },
  { id: 'p4', category: 'Bags', price: '₦18,500', image: POST_STORY_3 },
  { id: 'p5', category: 'Shoes', price: '₦38,500', image: POST_STORY_4 },
  { id: 'p6', category: 'Accessories', price: '₦12,000', image: POST_STORY_5 },
  { id: 'p7', category: 'Dresses', price: '₦32,500', image: POST_STORY_6 },
  { id: 'p8', category: 'Gowns', price: '₦55,000', image: POST_HERO },
  { id: 'p9', category: 'Bags', price: '₦22,400', image: PRODUCT_IMAGE },
];

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
  titleOnCream: { color: palette.ink.onLightStrong },
  headerRight: { flexDirection: 'row', gap: spacing['2'] },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  iconBtnOnCream: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(28, 22, 14, 0.08)',
  },
  modeWrap: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['3'],
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
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
    backgroundColor: 'rgba(216, 149, 68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.40)',
  },
  vendorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(216, 149, 68,0.20)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  tileMeta: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    gap: 1,
  },
  tilePrice: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#fff',
  },
  tileCategory: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  bioBlock: {
    paddingHorizontal: spacing['5'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['3'],
    gap: 4,
  },
  bioLine: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  bioText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
  },
  bioLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.amber,
    marginTop: 2,
  },
  categoryRow: {
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    gap: spacing['2'],
  },
  categoryChip: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  categoryChipOn: {
    backgroundColor: palette.bg.surface,
    borderColor: palette.bg.surface,
  },
  categoryLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  categoryLabelOn: {
    color: palette.ink.onLightStrong,
  },
});

const instaStyles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: 'rgba(216, 149, 68,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['4'],
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: { alignItems: 'center' },
  statValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
  },
  statLabel: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  identity: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    flexWrap: 'wrap',
  },
  displayName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: palette.status.success,
  },
  kycBadgeText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    color: '#fff',
  },
  bio: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: palette.ink.onDarkSoft,
    marginTop: 2,
  },
  bioLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.amber,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
  },
  button: {
    flex: 1,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  buttonLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216, 149, 68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.30)',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(216, 149, 68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.25)',
  },
  privacyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(216, 149, 68,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  privacySub: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
    gap: spacing['2'],
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    padding: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  quickBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    color: '#fff',
  },
  quickLabel: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  iconTabs: {
    flexDirection: 'row',
    marginTop: spacing['5'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconTab: {
    flex: 1,
    paddingVertical: spacing['3'],
    alignItems: 'center',
  },
  iconTabActive: {
    borderBottomWidth: 1,
    borderBottomColor: palette.ink.onDarkStrong,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing['3'],
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
  },
  tile: {
    width: '47.5%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLockOverlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePinned: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileStats: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    gap: 6,
  },
  tileStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tileStatText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  tileVendor: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  tileVendorText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: typography.bodyEmphasis.fontFamily,
    flex: 1,
  },
  tileEarning: {
    color: palette.brand.amber,
    fontSize: 10,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  tabBadge: {
    position: 'absolute',
    top: 6,
    right: '30%',
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
    paddingHorizontal: spacing['5'],
    gap: 8,
  },
  emptyTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
  },
});
