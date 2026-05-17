import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { LivePill } from '@/components/ui/LivePill';
import { RepostSheet } from '@/components/ui/RepostSheet';
import { useIsReposted } from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const REEL_HEIGHT = SCREEN_HEIGHT;

type Sort = 'closest' | 'rated';

type Reel = {
  id: string;
  vendor: string;
  handle: string;
  verified: boolean;
  product: string;
  price: number;
  description: string;
  distance: number;
  likes: number;
  comments: number;
  cover: [string, string, string];
  placeId: string;
  /** Optional: reel is a live broadcast (live tasting, live shoot, live demo). */
  isLive?: boolean;
};

const REELS: Reel[] = [
  {
    id: 'r1',
    vendor: 'Aisha Threads',
    handle: 'aishathreads',
    verified: true,
    product: 'Ankara A-line Dress',
    price: 18500,
    description: 'Hand-embroidered, custom fit · ships in 3 days · NIN-verified vendor',
    distance: 0.4,
    likes: 1248,
    comments: 86,
    cover: ['#5A2A1A', '#3a2818', '#1f1108'],
    placeId: 'p1',
  },
  {
    id: 'r2',
    vendor: 'GadgetFix Hub',
    handle: 'gadgetfix',
    verified: true,
    product: 'iPhone screen replacement',
    price: 45000,
    description: 'Same-day repair · 6-month warranty · 0.9 km away',
    distance: 0.9,
    likes: 412,
    comments: 31,
    cover: ['#1f3a3a', '#0F2A22', '#06140F'],
    placeId: 'p2',
  },
  {
    id: 'r3',
    vendor: 'Zara Cakes',
    handle: 'zaracakes',
    verified: false,
    product: 'Custom birthday cake',
    price: 22000,
    description: 'Order 24h ahead · pick-up or delivery · vanilla / chocolate',
    distance: 1.2,
    likes: 894,
    comments: 122,
    cover: ['#3a1f2c', '#2A1422', '#160913'],
    placeId: 'p3',
  },
  {
    id: 'r4',
    vendor: 'Mide Studios',
    handle: 'midestudios',
    verified: true,
    product: 'Portrait session · LIVE shoot',
    price: 65000,
    description: 'Watching the Saturday session live — open booking slot ends in 18 min',
    distance: 1.8,
    likes: 562,
    comments: 47,
    cover: ['#2c2c3a', '#1A1A2A', '#0E0E1A'],
    placeId: 'p4',
    isLive: true,
  },
  {
    id: 'r5',
    vendor: "Sarah's Boutique",
    handle: 'sarahsboutique',
    verified: true,
    product: 'Office two-piece set',
    price: 27000,
    description: 'Comfortable, breathable, Lagos-commute tested · same-day delivery in VI',
    distance: 0.7,
    likes: 1840,
    comments: 154,
    cover: ['#1A2C44', '#101E33', '#080F1F'],
    placeId: 'p5',
  },
  {
    id: 'r6',
    vendor: 'Tola Threads',
    handle: 'tolathreads',
    verified: true,
    product: 'Super Eagles tribute jersey',
    price: 14500,
    description: 'Naija-tailored sizing · pre-orders close Friday · ships from Yaba',
    distance: 2.1,
    likes: 4120,
    comments: 312,
    cover: ['#0F3D2E', '#0A2A20', '#051410'],
    placeId: 'p6',
  },
  {
    id: 'r7',
    vendor: 'Beauty by Femi',
    handle: 'beautybyfemi',
    verified: true,
    product: 'Glow hydration kit',
    price: 18990,
    description: '5-step routine · 28-day supply · free shipping above ₦20K',
    distance: 1.1,
    likes: 980,
    comments: 64,
    cover: ['#3D2E45', '#2A1F34', '#150F1A'],
    placeId: 'p7',
  },
  {
    id: 'r8',
    vendor: 'Doyin Beauty',
    handle: 'doyinbeauty',
    verified: true,
    product: 'Bridal makeup + gele',
    price: 95000,
    description: 'Full bridal package · gele included · weekend bookings filling fast',
    distance: 3.4,
    likes: 2140,
    comments: 178,
    cover: ['#4A1A2A', '#330F1F', '#1A070F'],
    placeId: 'p8',
  },
  {
    id: 'r9',
    vendor: 'Chioma Interiors',
    handle: 'chiomainteriors',
    verified: false,
    product: 'Emerald velvet ottoman pair',
    price: 88000,
    description: 'Studio clearance · brand new · pick-up or local delivery Lekki',
    distance: 4.2,
    likes: 312,
    comments: 28,
    cover: ['#0F3D2A', '#0A2A1F', '#05140F'],
    placeId: 'p9',
  },
  {
    id: 'r10',
    vendor: 'Tunde Otun Studio',
    handle: 'tundeotun',
    verified: true,
    product: 'Lagos rooftops print bundle',
    price: 52000,
    description: 'Edition of 10 · print + digital · signed · ships rolled',
    distance: 2.8,
    likes: 1421,
    comments: 92,
    cover: ['#1F1F3A', '#15152A', '#0A0A1A'],
    placeId: 'p10',
  },
  {
    id: 'r11',
    vendor: 'Naija Kitchen',
    handle: 'naijakitchen',
    verified: true,
    product: 'Jollof party platter — LIVE tasting',
    price: 35000,
    description: 'Wood-fire tasting live now · 412 cooks watching · order in to skip the queue',
    distance: 1.6,
    likes: 3210,
    comments: 412,
    cover: ['#3A2A0F', '#2A1F0A', '#150F05'],
    placeId: 'p11',
    isLive: true,
  },
  {
    id: 'r12',
    vendor: 'Adaeze Heels',
    handle: 'adaezeheels',
    verified: true,
    product: 'Camel-suede heeled boots',
    price: 38500,
    description: 'Restock · sizes 38-42 · ships nationwide via GIG · 7-day returns',
    distance: 2.3,
    likes: 1640,
    comments: 138,
    cover: ['#3A1F0F', '#2A150A', '#150A05'],
    placeId: 'p12',
  },
  {
    id: 'r13',
    vendor: "Femi's Sound",
    handle: 'femisound',
    verified: false,
    product: 'DJ booking · 4-hour set',
    price: 120000,
    description: 'Wedding · birthday · all-genre · full PA included · Lagos + Ibadan',
    distance: 5.1,
    likes: 487,
    comments: 51,
    cover: ['#3A0F2A', '#2A0A1F', '#15050F'],
    placeId: 'p13',
  },
  {
    id: 'r14',
    vendor: 'Kemi Books',
    handle: 'kemibooks',
    verified: true,
    product: 'Naija fiction starter pack',
    price: 24000,
    description: '5 titles · Adichie, Cole, Onuzo + 2 new voices · gift-wrapped',
    distance: 3.0,
    likes: 612,
    comments: 73,
    cover: ['#1A3A2A', '#0F2A1F', '#05140F'],
    placeId: 'p14',
  },
];

export default function DiscoverScreen() {
  const [searchOpen, setSearchOpen] = useState(false);

  if (searchOpen) {
    return <SearchView onClose={() => setSearchOpen(false)} />;
  }

  return <ReelsView onSearchPress={() => setSearchOpen(true)} />;
}

/** TikTok-style vertical feed of vendor product reels. */
function ReelsView({ onSearchPress }: { onSearchPress: () => void }) {
  return (
    <View style={styles.reelsRoot}>
      <FlatList
        data={REELS}
        keyExtractor={(r) => r.id}
        snapToInterval={REEL_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        pagingEnabled
        renderItem={({ item }) => <ReelCard reel={item} />}
      />

      <SafeAreaView edges={['top']} style={styles.reelsTopBar} pointerEvents="box-none">
        <Pressable onPress={onSearchPress} style={styles.reelsSearch}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={13} color={palette.brand.orange} />
          </View>
          <Text style={styles.reelsSearchText}>
            Ask Vibe — "tailor near me", "phone screen"…
          </Text>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.85)" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const reposted = useIsReposted(reel.id);

  return (
    <Pressable
      onPress={() => router.push(`/place/${reel.placeId}` as never)}
      style={styles.reel}>
      <LinearGradient colors={reel.cover} style={StyleSheet.absoluteFill} />
      {/* Faux product imagery — diagonal cross hatch + glow */}
      <View style={styles.reelImageOverlay}>
        <Ionicons name="image" size={48} color="rgba(255,255,255,0.18)" />
      </View>
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Live indicator (chartreuse pill) — only when broadcasting */}
      {reel.isLive ? (
        <View style={styles.liveBadgeWrap}>
          <LivePill />
        </View>
      ) : null}

      {/* Right action rail */}
      <View style={styles.actionRail}>
        <ActionRailBtn
          icon={liked ? 'heart' : 'heart-outline'}
          tint={liked ? palette.brand.orangeDeep : '#fff'}
          count={(reel.likes + (liked ? 1 : 0)).toLocaleString()}
          onPress={() => setLiked((s) => !s)}
        />
        <ActionRailBtn
          icon="chatbubble-ellipses-outline"
          count={reel.comments.toString()}
          onPress={() => {}}
        />
        <ActionRailBtn
          icon="repeat"
          count={reposted ? 'Reposted' : 'Repost'}
          tint={reposted ? palette.brand.orange : '#fff'}
          onPress={() => setRepostOpen(true)}
        />
        <ActionRailBtn
          icon="paper-plane-outline"
          count="Share"
          onPress={() => {}}
        />
        <ActionRailBtn
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          tint={saved ? palette.brand.amber : '#fff'}
          count="Save"
          onPress={() => setSaved((s) => !s)}
        />
        <ActionRailBtn
          icon="storefront"
          count="Visit"
          tint={palette.brand.orange}
          onPress={() => router.push(`/place/${reel.placeId}` as never)}
        />
      </View>

      {/* Bottom info */}
      <SafeAreaView edges={['bottom']} style={styles.reelInfo}>
        <View style={styles.vendorRow}>
          <View style={styles.vendorAvatar}>
            <Ionicons name="storefront" size={16} color={palette.ink.onLightStrong} />
          </View>
          <Text style={styles.vendorName}>{reel.vendor}</Text>
          {reel.verified ? (
            <View style={styles.vendorVerify}>
              <Ionicons name="shield-checkmark" size={10} color="#fff" />
            </View>
          ) : null}
          <View style={styles.distancePill}>
            <Ionicons name="location" size={10} color="#fff" />
            <Text style={styles.distancePillText}>{reel.distance} km</Text>
          </View>
          <Pressable style={styles.followBtn}>
            <Text style={styles.followText}>Follow</Text>
          </Pressable>
        </View>
        <Text style={styles.productName}>{reel.product}</Text>
        <Text style={styles.productPrice}>
          ₦{reel.price.toLocaleString('en-NG')}
        </Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {reel.description}
        </Text>
      </SafeAreaView>

      <RepostSheet
        visible={repostOpen}
        onClose={() => setRepostOpen(false)}
        product={{
          id: reel.id,
          name: reel.product,
          price: `₦${reel.price.toLocaleString('en-NG')}`,
          vendor: reel.vendor,
          vendorId: reel.handle,
        }}
      />
    </Pressable>
  );
}

function ActionRailBtn({
  icon,
  count,
  onPress,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: string;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.railBtn} hitSlop={8}>
      <Ionicons name={icon} size={28} color={tint ?? '#fff'} />
      <Text style={styles.railCount}>{count}</Text>
    </Pressable>
  );
}

/** Google Business-style search list. */
function SearchView({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('closest');

  const sorted = useMemo(() => {
    const arr = [...SEARCH_RESULTS];
    if (sort === 'closest') arr.sort((a, b) => a.distance - b.distance);
    else arr.sort((a, b) => a.rank - b.rank);
    return arr;
  }, [sort]);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.searchRoot}>
        <View style={styles.searchHeader}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.searchBack}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
          <View style={styles.searchInputBar}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={13} color={palette.brand.orange} />
            </View>
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder='Ask Vibe — "tailor near me"…'
              placeholderTextColor={palette.ink.onDarkMuted}
              style={styles.searchInputText}
              returnKeyType="search"
            />
            {query ? (
              <Pressable hitSlop={6} onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={palette.ink.onDarkSoft} />
              </Pressable>
            ) : (
              <Ionicons name="mic" size={16} color={palette.ink.onDarkSoft} />
            )}
          </View>
        </View>

        <View style={styles.filterRow}>
          <SortChip
            active={sort === 'closest'}
            icon="navigate"
            label="Closest"
            onPress={() => setSort('closest')}
          />
          <SortChip
            active={sort === 'rated'}
            icon="trophy"
            label="Highest ranked"
            onPress={() => setSort('rated')}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {!query ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagRow}>
              {QUICK_TAGS.map((t) => (
                <Pressable key={t} onPress={() => setQuery(t)} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <Text style={styles.sectionTitle}>
            {sort === 'closest' ? 'Closest to you' : 'Highest ranked nearby'}
          </Text>

          {sorted.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push(`/place/${r.id}` as never)}
              style={styles.resultCard}>
              <LinearGradient colors={r.cover} style={styles.resultCover}>
                {r.verified ? (
                  <View style={styles.coverBadge}>
                    <Ionicons name="shield-checkmark" size={11} color="#fff" />
                    <Text style={styles.coverBadgeText}>YFN</Text>
                  </View>
                ) : null}
              </LinearGradient>
              <View style={styles.resultBody}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {r.name}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={12} color={palette.brand.amber} />
                  <Text style={styles.resultRating}>{r.rating}</Text>
                  <Text style={styles.resultMeta}>({r.reviews})</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.resultMeta}>{r.category}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location" size={12} color={palette.brand.orange} />
                  <Text style={styles.resultMeta}>{r.distance} km</Text>
                  <Text style={styles.dot}>·</Text>
                  <Text
                    style={[
                      styles.resultMeta,
                      r.open ? { color: palette.status.success } : { color: palette.status.danger },
                    ]}>
                    {r.open ? `Open · ${r.closesAt}` : `Closed · ${r.closesAt}`}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function SortChip({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.sortChip, active && styles.sortChipOn]}>
      <Ionicons
        name={icon}
        size={14}
        color={active ? palette.ink.onLightStrong : palette.ink.onDarkSoft}
      />
      <Text style={[styles.sortLabel, active && styles.sortLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const QUICK_TAGS = [
  'Tailor',
  'Gadget repair',
  'Jollof',
  'Photographer',
  'Hair stylist',
  'Cake',
  'Makeup',
  'DJ',
  'Florist',
  'Carpenter',
  'Cleaner',
  'Mechanic',
  'Laundry',
  'Personal trainer',
];

const SEARCH_RESULTS = [
  {
    id: 'p1',
    name: 'Aisha Threads',
    category: 'Tailor',
    rating: 4.9,
    reviews: 312,
    distance: 0.4,
    open: true,
    closesAt: '7:00 PM',
    verified: true,
    rank: 1,
    cover: ['#3a2818', '#1f1108'] as [string, string],
  },
  {
    id: 'p2',
    name: 'GadgetFix Hub',
    category: 'Phone & laptop repair',
    rating: 4.7,
    reviews: 184,
    distance: 0.9,
    open: true,
    closesAt: '8:00 PM',
    verified: true,
    rank: 2,
    cover: ['#1f3a2c', '#0f1f17'] as [string, string],
  },
  {
    id: 'p3',
    name: 'Zara Cakes',
    category: 'Bakery · Cake decorator',
    rating: 4.8,
    reviews: 96,
    distance: 1.2,
    open: false,
    closesAt: 'Opens 9 AM',
    verified: false,
    rank: 5,
    cover: ['#3a1f2c', '#1f0e17'] as [string, string],
  },
  {
    id: 'p4',
    name: 'Mide Studios',
    category: 'Photographer',
    rating: 4.6,
    reviews: 58,
    distance: 1.8,
    open: true,
    closesAt: '10:00 PM',
    verified: true,
    rank: 3,
    cover: ['#2c2c3a', '#15151f'] as [string, string],
  },
  {
    id: 'p5',
    name: "Sarah's Boutique",
    category: 'Womenswear · Office',
    rating: 4.8,
    reviews: 421,
    distance: 0.7,
    open: true,
    closesAt: '9:00 PM',
    verified: true,
    rank: 4,
    cover: ['#1A2C44', '#080F1F'] as [string, string],
  },
  {
    id: 'p6',
    name: 'Tola Threads',
    category: 'Sportswear · Jerseys',
    rating: 4.7,
    reviews: 240,
    distance: 2.1,
    open: true,
    closesAt: '8:00 PM',
    verified: true,
    rank: 6,
    cover: ['#0F3D2E', '#051410'] as [string, string],
  },
  {
    id: 'p7',
    name: 'Beauty by Femi',
    category: 'Skincare · Cosmetics',
    rating: 4.9,
    reviews: 512,
    distance: 1.1,
    open: true,
    closesAt: '7:30 PM',
    verified: true,
    rank: 7,
    cover: ['#3D2E45', '#150F1A'] as [string, string],
  },
  {
    id: 'p8',
    name: 'Doyin Beauty',
    category: 'Makeup artist · Bridal',
    rating: 4.95,
    reviews: 198,
    distance: 3.4,
    open: false,
    closesAt: 'Opens 10 AM',
    verified: true,
    rank: 8,
    cover: ['#4A1A2A', '#1A070F'] as [string, string],
  },
  {
    id: 'p9',
    name: 'Chioma Interiors',
    category: 'Furniture · Decor',
    rating: 4.5,
    reviews: 74,
    distance: 4.2,
    open: true,
    closesAt: '6:00 PM',
    verified: false,
    rank: 14,
    cover: ['#0F3D2A', '#05140F'] as [string, string],
  },
  {
    id: 'p10',
    name: 'Tunde Otun Studio',
    category: 'Fine art · Prints',
    rating: 4.7,
    reviews: 132,
    distance: 2.8,
    open: true,
    closesAt: '9:00 PM',
    verified: true,
    rank: 9,
    cover: ['#1F1F3A', '#0A0A1A'] as [string, string],
  },
  {
    id: 'p11',
    name: 'Naija Kitchen',
    category: 'Catering · Jollof specialist',
    rating: 4.9,
    reviews: 642,
    distance: 1.6,
    open: true,
    closesAt: '10:00 PM',
    verified: true,
    rank: 10,
    cover: ['#3A2A0F', '#150F05'] as [string, string],
  },
  {
    id: 'p12',
    name: 'Adaeze Heels',
    category: 'Footwear',
    rating: 4.6,
    reviews: 254,
    distance: 2.3,
    open: true,
    closesAt: '8:00 PM',
    verified: true,
    rank: 11,
    cover: ['#3A1F0F', '#150A05'] as [string, string],
  },
];

const styles = StyleSheet.create({
  // ----- Reels view -----
  reelsRoot: { flex: 1, backgroundColor: '#000' },
  reel: {
    height: REEL_HEIGHT,
    overflow: 'hidden',
  },
  liveBadgeWrap: {
    position: 'absolute',
    top: 72,
    left: spacing['4'],
  },
  reelImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelsTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing['4'],
  },
  reelsSearch: {
    marginTop: spacing['2'],
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3'],
    gap: spacing['2'],
  },
  reelsSearchText: {
    flex: 1,
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  aiBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(216, 149, 68,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRail: {
    position: 'absolute',
    right: spacing['3'],
    bottom: 200,
    gap: spacing['4'],
    alignItems: 'center',
  },
  railBtn: { alignItems: 'center', gap: 4 },
  railCount: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  reelInfo: {
    position: 'absolute',
    left: spacing['4'],
    right: 80,
    bottom: spacing['4'],
    gap: 6,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
    flexWrap: 'wrap',
  },
  vendorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  vendorVerify: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  distancePillText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  followBtn: {
    paddingHorizontal: spacing['3'],
    height: 26,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  followText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  productName: {
    ...typography.title,
    fontSize: 18,
    color: '#fff',
  },
  productPrice: {
    ...typography.h2,
    fontSize: 22,
    color: palette.brand.orange,
  },
  productDesc: {
    ...typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // ----- Search view -----
  searchRoot: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
  },
  searchBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  searchInputBar: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3'],
    gap: spacing['2'],
  },
  searchInputText: {
    flex: 1,
    ...typography.body,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    gap: spacing['2'],
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    height: 36,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  sortChipOn: {
    backgroundColor: palette.bg.surface,
    borderColor: palette.bg.surface,
  },
  sortLabel: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  sortLabelOn: { color: palette.ink.onLightStrong },
  scroll: { paddingTop: spacing['4'] },
  tagRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  tagChip: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    justifyContent: 'center',
  },
  tagText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
  },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['3'],
  },
  resultCard: {
    marginHorizontal: spacing['4'],
    marginBottom: spacing['3'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    flexDirection: 'row',
  },
  resultCover: {
    width: 110,
    padding: spacing['2'],
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  coverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: palette.status.success,
  },
  coverBadgeText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  resultBody: {
    flex: 1,
    padding: spacing['3'],
    gap: 4,
  },
  resultName: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resultRating: {
    ...typography.caption,
    color: palette.ink.onDarkStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  resultMeta: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  dot: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginHorizontal: 2,
  },
});
