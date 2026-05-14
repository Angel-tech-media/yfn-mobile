import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { ZebraBackground } from '@/components/ui/ZebraBackground';
import { useEngagement, useIsFollowing } from '@/src/store/engagement';
import { useUser } from '@/src/store/user';
import { palette, radius, spacing, typography } from '@/src/theme';

type Profile = {
  handle: string;
  name: string;
  kyc: boolean;
  /** Buyer profiles read different to vendors — we paint a subtle zebra on top. */
  kind: 'buyer' | 'vendor';
  bio: string;
  link?: string;
  followers: number;
  following: number;
  posts: number;
  /** Whether this account is configured private (data minimization default). */
  isPrivate: boolean;
  isMutual: boolean;
  covers: Array<[string, string]>;
};

const FALLBACK: Profile = {
  handle: 'davidokpo',
  name: 'David Okpo',
  kyc: true,
  kind: 'buyer',
  bio: 'Lagos · finding good food, good cake, good books\nKYC-verified buyer on Vibe',
  link: 'vibe.app/u/davidokpo',
  followers: 312,
  following: 284,
  posts: 48,
  isPrivate: true,
  isMutual: false,
  covers: [
    ['#1E2A4A', '#06091A'],
    ['#3D2E45', '#150F1A'],
    ['#0F3D2E', '#051410'],
    ['#3A2A0F', '#150F05'],
  ],
};

// Mock directory of known profiles. Anything else falls back to FALLBACK.
const PROFILES: Record<string, Profile> = {
  davidokpo: FALLBACK,
  aishabello: { ...FALLBACK, handle: 'aishabello', name: 'Aisha Bello', followers: 4200, isMutual: true },
  joshuaola: { ...FALLBACK, handle: 'joshuaola', name: 'Joshua Olamilekan-Ayan', followers: 1820, isMutual: false },
  midemoji: { ...FALLBACK, handle: 'midemoji', name: 'Mide', followers: 8200, isMutual: true, isPrivate: false, bio: 'Lagos creative · DM open for collabs' },
  bisia: { ...FALLBACK, handle: 'bisia', name: 'Bisi A.', followers: 612, isMutual: false },
  chideran: { ...FALLBACK, handle: 'chideran', name: 'Chidera N.', followers: 980, isMutual: true },
  tundeo: { ...FALLBACK, handle: 'tundeo', name: 'Tunde O.', followers: 720, isMutual: true, bio: 'Reader · One Piece, Things Fall Apart, anything Adichie' },
  doyinojo: { ...FALLBACK, handle: 'doyinojo', name: 'Doyin Ojo', followers: 1410, isMutual: false },
  olufemia: { ...FALLBACK, handle: 'olufemia', name: 'Olufemi Adekoya', followers: 2400, isMutual: true, isPrivate: false, bio: 'Lagos rooftops & sundowns · @vibeapp early user' },
  zainab: { ...FALLBACK, handle: 'zainab', name: 'Zainab Y.', followers: 388, isMutual: false },
  ekene: { ...FALLBACK, handle: 'ekene', name: 'Ekene I.', followers: 1180, isMutual: false },
  halima: { ...FALLBACK, handle: 'halima', name: 'Halima G.', followers: 540, isMutual: true },
  folake: { ...FALLBACK, handle: 'folake', name: 'Folake B.', followers: 2080, isMutual: false },
  ngozi: { ...FALLBACK, handle: 'ngozi', name: 'Ngozi C.', followers: 1320, isMutual: true },
  tundeotun: {
    ...FALLBACK,
    handle: 'tundeotun',
    name: 'Tunde Otun',
    kind: 'vendor',
    bio: 'Photographer · Lagos rooftops series\nDM for prints + bookings',
    link: 'tundeotun.studio',
    followers: 14210,
    following: 412,
    posts: 247,
    isPrivate: false,
    isMutual: false,
  },
  aishathreads: {
    ...FALLBACK,
    handle: 'aishathreads',
    name: 'Aisha Threads',
    kind: 'vendor',
    bio: 'Bespoke Ankara · NIN-verified · Victoria Island\nSame-day fittings on weekdays',
    link: 'linktr.ee/aishathreads',
    followers: 24500,
    following: 312,
    posts: 412,
    isPrivate: false,
    isMutual: false,
  },
  sarahsboutique: {
    ...FALLBACK,
    handle: 'sarahsboutique',
    name: "Sarah's Boutique",
    kind: 'vendor',
    bio: 'Office two-piece capsule · Lekki + Ikeja\nFree delivery above ₦30K',
    link: 'sarahsboutique.com',
    followers: 18420,
    following: 245,
    posts: 380,
    isPrivate: false,
    isMutual: false,
  },
  gadgetfix: {
    ...FALLBACK,
    handle: 'gadgetfix',
    name: 'GadgetFix Hub',
    kind: 'vendor',
    bio: 'Phone & laptop repair · Same-day fit\n6-month warranty · NIN-verified',
    followers: 8200,
    following: 120,
    posts: 89,
    isPrivate: false,
    isMutual: false,
  },
  zaracakes: {
    ...FALLBACK,
    handle: 'zaracakes',
    name: 'Zara Cakes',
    kind: 'vendor',
    bio: 'Custom birthday + wedding cakes · Yaba\nOrder 48h ahead',
    followers: 6210,
    following: 188,
    posts: 142,
    isPrivate: false,
    isMutual: false,
  },
  midestudios: {
    ...FALLBACK,
    handle: 'midestudios',
    name: 'Mide Studios',
    kind: 'vendor',
    bio: 'Portrait + lifestyle photography\nBooking via DM only',
    link: 'midestudios.co',
    followers: 11240,
    following: 412,
    posts: 218,
    isPrivate: false,
    isMutual: false,
  },
  tolathreads: {
    ...FALLBACK,
    handle: 'tolathreads',
    name: 'Tola Threads',
    kind: 'vendor',
    bio: 'Jersey + sportswear · Yaba\nNaija-tailored sizing 🇳🇬',
    followers: 9620,
    following: 280,
    posts: 156,
    isPrivate: false,
    isMutual: false,
  },
  beautybyfemi: {
    ...FALLBACK,
    handle: 'beautybyfemi',
    name: 'Beauty by Femi',
    kind: 'vendor',
    bio: 'Skincare & cosmetics · NIN-verified\nFree ship above ₦20K',
    link: 'beautybyfemi.ng',
    followers: 14820,
    following: 320,
    posts: 287,
    isPrivate: false,
    isMutual: false,
  },
  doyinbeauty: {
    ...FALLBACK,
    handle: 'doyinbeauty',
    name: 'Doyin Beauty',
    kind: 'vendor',
    bio: 'Bridal makeup + gele specialist\nSaturday slots filling fast',
    followers: 7480,
    following: 410,
    posts: 198,
    isPrivate: false,
    isMutual: false,
  },
  naijakitchen: {
    ...FALLBACK,
    handle: 'naijakitchen',
    name: 'Naija Kitchen',
    kind: 'vendor',
    bio: 'Catering · Jollof specialist\nWood-fire only · Lagos mainland',
    followers: 21340,
    following: 188,
    posts: 312,
    isPrivate: false,
    isMutual: false,
  },
  kemibooks: {
    ...FALLBACK,
    handle: 'kemibooks',
    name: 'Kemi Books',
    kind: 'vendor',
    bio: 'Indie bookstore · African + Nigerian fiction\nGift-wrap free',
    followers: 4210,
    following: 612,
    posts: 145,
    isPrivate: false,
    isMutual: false,
  },
  ...generateBuyers(),
  ...generateVendors(),
};

function buyer(
  handle: string,
  name: string,
  followers: number,
  isMutual = false,
  bio?: string,
): Profile {
  return {
    ...FALLBACK,
    handle,
    name,
    kind: 'buyer',
    followers,
    isMutual,
    bio: bio ?? FALLBACK.bio,
  };
}

function vendor(
  handle: string,
  name: string,
  bio: string,
  followers: number,
  posts: number,
  link?: string,
): Profile {
  return {
    ...FALLBACK,
    handle,
    name,
    kind: 'vendor',
    bio,
    link,
    followers,
    following: Math.floor(followers * 0.04),
    posts,
    isPrivate: false,
    isMutual: false,
  };
}

function generateBuyers(): Record<string, Profile> {
  const list: Profile[] = [
    buyer('femiokoro', 'Femi Okoro', 1840, true, 'Lagos · sneakerhead · DM trades only'),
    buyer('amakaiwu', 'Amaka Iwu', 940, false, 'Reader · romance + thrillers'),
    buyer('seunajayi', 'Seun Ajayi', 612, true, 'Tech bro · plant dad'),
    buyer('rotimibello', 'Rotimi Bello', 2310, false),
    buyer('blessing', 'Blessing Eze', 1420, true, 'Bridal stylist · Ikoyi'),
    buyer('yetundeola', 'Yetunde Ola', 760, false, 'Slow weekends, good food'),
    buyer('davidoke', 'David Oke', 312, true, 'Photographer-in-training'),
    buyer('halimagombe', 'Halima Gombe', 480, false, 'Abuja · skincare'),
    buyer('kelechi', 'Kelechi Nnamdi', 1140, false, 'Football head · NFF die-hard'),
    buyer('omogbolahan', 'Omogbolahan F.', 220, true, 'Saturdays in Yaba'),
    buyer('temibakare', 'Temi Bakare', 980, false),
    buyer('charistosin', 'Chari Tosin', 1860, true, 'Anime · slow cooking · books'),
  ];
  return Object.fromEntries(list.map((p) => [p.handle, p]));
}

function generateVendors(): Record<string, Profile> {
  const list: Profile[] = [
    vendor('lekkitailor', 'Lekki Tailor', 'Bespoke menswear · Lekki Phase 1\nFittings by appointment', 12400, 312, 'lekkitailor.ng'),
    vendor('mamaputkitchen', "Mama Put Kitchen", 'Lagos street food · catering\nDaily 8am-9pm', 21300, 412),
    vendor('yabaprintshop', 'Yaba Print Shop', 'T-shirts, hoodies, mugs\nBulk discount 50+', 8420, 198),
    vendor('lagosflorist', 'Lagos Florist', 'Wedding & event florals\nDelivery across Lagos', 5610, 287),
    vendor('phonelifegadgets', 'PhoneLife Gadgets', 'Phone repairs + accessories\nWarranty on every fix', 14200, 245),
    vendor('jollofqueen', 'Jollof Queen', 'Party-size jollof rice\nWood-fire only', 18900, 156),
    vendor('aboabeauty', 'Aboa Beauty', 'Skincare + makeup\nNIN-verified · ships nationwide', 22400, 367),
    vendor('victoriacakes', 'Victoria Cakes', 'Birthday + wedding cakes\nVI studio', 9820, 198),
    vendor('ankaraworld', 'Ankara World', 'Ankara fabric + ready-to-wear\nSurulere flagship', 32800, 524),
    vendor('snipsbarber', 'Snips Barber', 'Premium barbershop · 2 chairs\nWalk-ins welcome', 4120, 87),
    vendor('amaplay', 'Amaplay Music', 'DJ services + sound rental\nLagos · Abuja', 7820, 132),
    vendor('greengrocer', 'Green Grocer NG', 'Farm-fresh produce delivery\nWeekly subscription', 5240, 142),
    vendor('zenwellness', 'Zen Wellness', 'Massage + spa · Ikoyi\nBook 24h ahead', 6480, 198),
    vendor('petroniaspa', 'Petronia Spa', 'Mani-pedi · gel · acrylic', 8920, 245),
    vendor('autocaredr', 'AutoCare Dr.', 'Mobile car wash + valet\nLagos + Abuja', 3140, 78),
    vendor('readinghouse', 'Reading House', 'Indie bookstore · café in Ikoyi', 12400, 312),
    vendor('builderspro', 'Builders Pro', 'Carpentry + furniture\nCustom orders welcome', 4280, 165),
    vendor('greenelectrics', 'Green Electrics', 'Solar install + maintenance\nFree home survey', 5840, 198),
    vendor('lekkilaundry', 'Lekki Laundry', 'Wash · dry · iron\n24-hour turnaround', 6210, 89),
    vendor('motherandmebaby', 'Mother & Me Baby', 'Baby clothes + gear\nMaternity included', 11200, 367),
    vendor('petspawnigeria', 'Pets Paw NG', 'Pet food + grooming\nLekki + Surulere', 7240, 218),
    vendor('legitprinters', 'Legit Printers', 'Business cards · banners · IDs\n24hr turnaround', 4120, 156),
    vendor('rooftopevents', 'Rooftop Events', 'Event venue + catering\nUp to 200 guests', 8420, 234),
    vendor('aniyaarts', 'Aniya Arts', 'Custom portraits · resin art\nMade in Ibadan', 5210, 187),
    vendor('lagosswim', 'Lagos Swim Co.', 'Swimwear + coverups\nBeach-ready collection', 14200, 287),
    vendor('hairgangng', 'Hair Gang NG', 'Wigs · weaves · cornrows\nVI showroom', 18400, 312),
    vendor('chefonye', 'Chef Onye Catering', 'Private chef · catering\nNigerian + continental', 6840, 198),
    vendor('starlight', 'Starlight DJ', 'DJ + MC + lights bundle\nWeddings + parties', 4810, 142),
    vendor('omaeyewear', 'Oma Eyewear', 'Designer frames + Rx lenses\nLagos + Abuja', 7240, 156),
    vendor('vintagecrate', 'Vintage Crate', 'Curated thrift + vintage\nDrops every Friday', 9620, 287),
    vendor('streetkitchenng', 'Street Kitchen NG', 'Suya · grilled fish · jollof\nLate-night menu', 12400, 256),
    vendor('yarnandloop', 'Yarn & Loop', 'Crochet + knit goods\nCustom orders open', 3420, 132),
    vendor('cleanslateng', 'CleanSlate NG', 'Deep clean + post-construction\nResidential + office', 4120, 87),
    vendor('papayaprintsng', 'Papaya Prints', 'Art prints + posters\nLimited edition runs', 5210, 187),
    vendor('lagostranscape', 'Lagos Transcape', 'Photography + cinematography\nBookings open', 8420, 245),
    vendor('honeyhive', 'Honey Hive', 'Raw honey + bee products\nDirect from farm', 4810, 142),
    vendor('mamacarescents', 'Mama Care Scents', 'Body scrubs + oils\nHandmade in Surulere', 6210, 198),
    vendor('bridalflorist', 'Bridal Florist NG', 'Wedding florals + decor\nLagos + Ibadan', 12400, 312),
    vendor('zincarchitecture', 'Zinc Architecture', 'Interior design + decor\nResidential focus', 3840, 132),
    vendor('rumourstreatgoods', 'Rumours Treat Goods', 'Cupcakes + cake jars\nDelivery in Lagos', 4210, 156),
    vendor('crowsneststudio', "Crow's Nest Studio", 'Tattoo studio · custom only\nBookings via DM', 7420, 198),
    vendor('cleanwheelsng', 'Clean Wheels NG', 'Sneaker restoration\nDM your sneakers', 3640, 142),
    vendor('zara4kidsng', 'Zara4Kids NG', 'Kids fashion · age 2-12\nLekki showroom', 8920, 287),
    vendor('lebrace', 'LeBrace Dental', 'Dental clinic · braces\nVI + Lekki', 5840, 142),
    vendor('greatlionsapparel', 'Great Lions Apparel', 'Streetwear · limited drops\nBuy 2 get 1 free', 14200, 312),
    vendor('shopboltng', 'ShopBolt NG', 'Electronics · gadgets\nAuthorised dealer', 18400, 412),
    vendor('rumourstreatcakes', 'Rumours Cake Bar', 'Cake by the slice\nLekki + VI shops', 6840, 198),
    vendor('lekkifit', 'Lekki Fit Gym', 'Gym + personal training\nMonthly membership', 4120, 142),
    vendor('crownjewelsng', 'Crown Jewels NG', 'Fine jewellery · handmade\nGold + silver', 8420, 234),
    vendor('lagosbouquet', 'Lagos Bouquet', 'Subscription florist\nWeekly fresh stems', 4810, 156),
  ];
  return Object.fromEntries(list.map((p) => [p.handle, p]));
}

export default function UserProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const profile = useMemo<Profile>(() => {
    const key = String(handle ?? '').replace(/^@/, '').toLowerCase();
    return PROFILES[key] ?? { ...FALLBACK, handle: key, name: '@' + key };
  }, [handle]);

  // Treat already-followed accounts as effectively mutual for the locked grid.
  const isFollowingNow = useIsFollowing(profile.handle);
  const effectivelyMutual = profile.isMutual || isFollowingNow;
  const toggleFollow = useEngagement((s) => s.toggleFollow);
  const showLocked = profile.isPrivate && !effectivelyMutual;
  // Vendors-only see a soft zebra texture when they open a buyer page — it
  // signals "this is a customer, not another vendor" without compromising
  // the buyer's privacy. Buyers never see this overlay.
  const viewerRole = useUser((s) => s.role);
  const showVendorZebra = viewerRole === 'vendor' && profile.kind === 'buyer';

  const [following, setFollowing] = useState(isFollowingNow);

  const handleFollow = () => {
    toggleFollow(profile.handle);
    setFollowing((s) => !s);
  };

  return (
    <EspressoBackground variant="espresso">
      {showVendorZebra ? (
        <ZebraBackground
          baseColor="transparent"
          stripeColor="rgba(255, 255, 255, 0.045)"
          spacing={20}
          stripeWidth={1.2}
        />
      ) : null}
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.topTitle}>@{profile.handle}</Text>
          <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="More">
            <Ionicons name="ellipsis-horizontal" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.avatarRing}>
              <Avatar size={84} initials={profile.name.slice(0, 2).toUpperCase()} />
            </View>
            <View style={styles.stats}>
              <Stat value={String(profile.posts)} label="Posts" />
              <Stat value={fmtCount(profile.followers)} label="Followers" />
              <Stat value={fmtCount(profile.following)} label="Following" />
            </View>
          </View>

          {/* Name + KYC badge + bio + link — always visible, never gated */}
          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{profile.name}</Text>
              {profile.kyc ? (
                <View style={styles.kycBadge}>
                  <Ionicons name="shield-checkmark" size={10} color="#fff" />
                  <Text style={styles.kycBadgeText}>YFN Verified</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.bio}>{profile.bio}</Text>
            {profile.link ? (
              <Pressable hitSlop={6}>
                <Text style={styles.bioLink}>{profile.link}</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Action row */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleFollow}
              style={[
                styles.followBtn,
                following && styles.followBtnOn,
              ]}>
              <Ionicons
                name={following ? 'checkmark' : 'person-add'}
                size={16}
                color={following ? palette.ink.onLightStrong : '#fff'}
              />
              <Text
                style={[
                  styles.followLabel,
                  following && { color: palette.ink.onLightStrong },
                ]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/messages/${profile.handle}` as never)}
              style={styles.secondaryBtn}>
              <Text style={styles.secondaryLabel}>Message</Text>
            </Pressable>
            <Pressable style={styles.iconAction} accessibilityLabel="Share profile">
              <Ionicons name="paper-plane-outline" size={16} color={palette.ink.onDarkStrong} />
            </Pressable>
          </View>

          {/* Locked / unlocked grid */}
          {showLocked ? (
            <View style={styles.privateGate}>
              <View style={styles.privateIcon}>
                <Ionicons name="lock-closed" size={28} color={palette.brand.accentSky} />
              </View>
              <Text style={styles.privateTitle}>This account is private</Text>
              <Text style={styles.privateText}>
                Follow {profile.name.split(' ')[0]} to see their posts, reels and
                tagged photos. Their bio and {fmtCount(profile.followers)} followers
                are public — everything else is for mutuals only.
              </Text>
              <View style={styles.privateGridShadow}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <View key={i} style={styles.privateGridTile}>
                    <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.25)" />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.iconTabs}>
                <View style={[styles.iconTab, styles.iconTabActive]}>
                  <Ionicons name="grid-outline" size={20} color={palette.ink.onDarkStrong} />
                </View>
                <View style={styles.iconTab}>
                  <Ionicons name="play-outline" size={20} color={palette.ink.onDarkMuted} />
                </View>
                <View style={styles.iconTab}>
                  <Ionicons name="person-outline" size={20} color={palette.ink.onDarkMuted} />
                </View>
              </View>
              <View style={styles.grid}>
                {profile.covers.concat(profile.covers, profile.covers).slice(0, 12).map((c, i) => (
                  <View key={i} style={styles.tile}>
                    <LinearGradient colors={c} style={StyleSheet.absoluteFill} />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statColumn}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function fmtCount(n: number) {
  if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 80 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['2'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  topTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  headerRow: {
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
    backgroundColor: 'rgba(91, 168, 232, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing['4'],
  },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statColumn: { alignItems: 'center' },
  statValue: { fontFamily: typography.h2.fontFamily, fontSize: 18, color: palette.ink.onDarkStrong },
  statLabel: { ...typography.caption, color: palette.ink.onDarkMuted, marginTop: 2 },
  identity: { paddingHorizontal: spacing['4'], paddingTop: spacing['3'], gap: 4 },
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
    color: palette.brand.accentSky,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: palette.brand.orange,
  },
  followBtnOn: { backgroundColor: palette.bg.surface },
  followLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#fff',
  },
  secondaryBtn: {
    flex: 1,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  secondaryLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  iconTabs: {
    flexDirection: 'row',
    marginTop: spacing['5'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconTab: { flex: 1, paddingVertical: spacing['3'], alignItems: 'center' },
  iconTabActive: {
    borderBottomWidth: 1,
    borderBottomColor: palette.ink.onDarkStrong,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  tile: {
    width: '33.2%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  },
  privateGate: {
    marginTop: spacing['5'],
    marginHorizontal: spacing['4'],
    paddingVertical: spacing['8'],
    paddingHorizontal: spacing['5'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(91, 168, 232, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(91, 168, 232, 0.25)',
    alignItems: 'center',
    gap: spacing['2'],
  },
  privateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(91, 168, 232, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  privateTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  privateText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['3'],
  },
  privateGridShadow: {
    marginTop: spacing['4'],
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    opacity: 0.5,
  },
  privateGridTile: {
    width: '32.5%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
