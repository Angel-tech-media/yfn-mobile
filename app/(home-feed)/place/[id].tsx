import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { RepostSheet } from '@/components/ui/RepostSheet';
import { useIsReposted } from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

const HERO = require('@/assets/figma/store-banner.png');
const STORY_1 = require('@/assets/figma/story-1.png');
const STORY_2 = require('@/assets/figma/story-2.png');
const STORY_3 = require('@/assets/figma/story-3.png');
const STORY_4 = require('@/assets/figma/story-4.png');
const STORY_5 = require('@/assets/figma/story-5.png');
const STORY_6 = require('@/assets/figma/story-6.png');
const PRODUCT_IMG = require('@/assets/figma/product-sample.png');

type PlaceData = {
  id: string;
  /** Vendor handle used for repost attribution and deep links. */
  handle: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  priceTier: string;
  distance: number;
  verified: boolean;
  rank: string;
  open: boolean;
  closesAt: string;
  address: string;
  phone: string;
  about: string;
  hours: Array<{ day: string; hours: string }>;
  photos: any[];
  products: Array<{ id: string; name: string; price: number; image: any }>;
  reviewsList: Array<{ id: string; author: string; rating: number; age: string; text: string }>;
};

const FALLBACK: PlaceData = {
  id: 'p1',
  handle: 'aishathreads',
  name: 'Aisha Threads',
  category: 'Tailor · Fashion designer',
  rating: 4.9,
  reviews: 312,
  priceTier: '₦₦',
  distance: 0.4,
  verified: true,
  rank: 'Top 5% in Lagos',
  open: true,
  closesAt: '7:00 PM',
  address: '14B Adeola Odeku St, Victoria Island',
  phone: '+234 803 555 0142',
  about:
    'Bespoke tailoring for women — Ankara dresses, gowns, and contemporary pieces. NIN-verified vendor on Vibe with 6 years of experience.',
  hours: [
    { day: 'Mon', hours: '9:00 AM – 7:00 PM' },
    { day: 'Tue', hours: '9:00 AM – 7:00 PM' },
    { day: 'Wed', hours: '9:00 AM – 7:00 PM' },
    { day: 'Thu', hours: '9:00 AM – 7:00 PM' },
    { day: 'Fri', hours: '9:00 AM – 8:00 PM' },
    { day: 'Sat', hours: '10:00 AM – 8:00 PM' },
    { day: 'Sun', hours: 'Closed' },
  ],
  photos: [HERO, STORY_1, STORY_2, STORY_3, STORY_4],
  products: [
    { id: 'p1', name: 'Ankara A-line Dress', price: 18500, image: STORY_1 },
    { id: 'p2', name: 'Lace Gown — Custom', price: 42000, image: STORY_2 },
    { id: 'p3', name: 'Office Two-piece', price: 27000, image: STORY_3 },
    { id: 'p4', name: 'Embroidered Gele', price: 8500, image: STORY_4 },
  ],
  reviewsList: [
    { id: 'r1', author: 'Bisi A.', rating: 5, age: '2 days ago', text: 'Perfect fit, delivered ahead of schedule. Will order again.' },
    { id: 'r2', author: 'Tunde O.', rating: 5, age: '1 week ago', text: 'Quality fabric and the embroidery is on another level.' },
    { id: 'r3', author: 'Chioma I.', rating: 4, age: '3 weeks ago', text: 'Great work, just took a day longer than agreed.' },
  ],
};

const PLACES: Record<string, PlaceData> = {
  p1: FALLBACK,
  p2: {
    ...FALLBACK,
    id: 'p2',
    handle: 'gadgetfixhub',
    name: 'GadgetFix Hub',
    category: 'Phone & laptop repair',
    rating: 4.7,
    reviews: 184,
    priceTier: '₦',
    distance: 0.9,
    rank: 'Top repair shop · VI',
    address: '22 Akin Adesola, Victoria Island',
    phone: '+234 802 555 0801',
    about: 'Same-day phone + laptop repair · 6-month warranty on all fixes · Authorised dealer for screens & batteries.',
    products: [
      { id: 'pf1', name: 'iPhone screen replacement', price: 45000, image: STORY_2 },
      { id: 'pf2', name: 'Battery swap', price: 12000, image: STORY_3 },
      { id: 'pf3', name: 'Charging port fix', price: 9500, image: STORY_4 },
    ],
  },
  p3: {
    ...FALLBACK,
    id: 'p3',
    handle: 'zaracakes',
    name: 'Zara Cakes',
    category: 'Bakery · Cake decorator',
    rating: 4.8,
    reviews: 96,
    distance: 1.2,
    open: false,
    closesAt: 'Opens 9 AM',
    rank: 'Rising star',
    address: '8 Marwa Rd, Lekki Phase 1',
    phone: '+234 815 555 0140',
    about: 'Custom birthday + wedding cakes · order 48h ahead · pick-up or delivery.',
    products: [
      { id: 'pz1', name: 'Three-tier celebration cake', price: 42000, image: STORY_1 },
      { id: 'pz2', name: 'Cupcakes (12 pack)', price: 12000, image: STORY_2 },
      { id: 'pz3', name: 'Cake jars', price: 4500, image: STORY_3 },
    ],
  },
  p4: {
    ...FALLBACK,
    id: 'p4',
    handle: 'midestudios',
    name: 'Mide Studios',
    category: 'Photographer',
    rating: 4.6,
    reviews: 58,
    distance: 1.8,
    rank: 'Top photographer in Lekki',
    address: '15 Admiralty Way, Lekki',
    phone: '+234 909 555 0220',
    about: 'Portrait + lifestyle photographer · 1-hour shoot · 20 edited photos · indoor or location.',
    products: [
      { id: 'pm1', name: 'Portrait session', price: 65000, image: STORY_4 },
      { id: 'pm2', name: 'Couples shoot', price: 95000, image: STORY_5 },
      { id: 'pm3', name: 'Pre-wedding · half day', price: 250000, image: STORY_6 },
    ],
  },
};

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG');

type RepostTarget = {
  id: string;
  name: string;
  price: string;
  vendor: string;
  vendorId: string;
};

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = PLACES[String(id ?? 'p1')] ?? FALLBACK;
  const [hoursOpen, setHoursOpen] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [repostTarget, setRepostTarget] = useState<RepostTarget | null>(null);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero photo carousel */}
          <View style={styles.heroWrap}>
            <Image source={place.photos[0]} style={styles.hero} contentFit="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.35)', 'transparent']}
              style={styles.heroOverlayTop}
            />
            <View style={styles.heroTopBar}>
              <Pressable
                onPress={() => router.back()}
                accessibilityLabel="Back"
                style={styles.heroIconBtn}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </Pressable>
              <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                <Pressable accessibilityLabel="Save" style={styles.heroIconBtn}>
                  <Ionicons name="bookmark-outline" size={18} color="#fff" />
                </Pressable>
                <Pressable accessibilityLabel="Share" style={styles.heroIconBtn}>
                  <Ionicons name="share-outline" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
            <View style={styles.heroDots}>
              {place.photos.map((_, i) => (
                <View key={i} style={[styles.heroDot, i === 0 && styles.heroDotOn]} />
              ))}
            </View>
          </View>

          <View style={styles.body}>
            {/* Title row */}
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{place.name}</Text>
                  {place.verified ? (
                    <View style={styles.verifyBadge}>
                      <Ionicons name="shield-checkmark" size={11} color="#fff" />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.subtitle}>{place.category}</Text>
              </View>
              <View style={styles.rankPill}>
                <Ionicons name="trophy" size={12} color={palette.brand.orange} />
                <Text style={styles.rankText}>{place.rank}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="star" size={14} color={palette.brand.amber} />
              <Text style={styles.metaStrong}>{place.rating}</Text>
              <Text style={styles.metaMuted}>({place.reviews} reviews)</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaMuted}>{place.priceTier}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaMuted}>{place.distance} km</Text>
            </View>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  place.open ? styles.statusDotOpen : styles.statusDotClosed,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  place.open ? styles.statusOpen : styles.statusClosed,
                ]}>
                {place.open ? 'Open now' : 'Closed'}
              </Text>
              <Text style={styles.metaMuted}>· {place.closesAt}</Text>
            </View>

            {/* Action row */}
            <View style={styles.actionRow}>
              <ActionBtn icon="navigate" label="Directions" primary />
              <ActionBtn icon="call" label="Call" />
              <ActionBtn
                icon="chatbubble"
                label="Message"
                onPress={() =>
                  router.push(`/messages/${place.id}` as never)
                }
              />
              <ActionBtn
                icon={followed ? 'checkmark' : 'add'}
                label={followed ? 'Following' : 'Follow'}
                onPress={() => setFollowed((s) => !s)}
              />
              <ActionBtn icon="share-social" label="Share" />
            </View>

            {/* Map preview */}
            <Pressable style={styles.mapPreview}>
              <LinearGradient
                colors={['#2a4a3a', '#1f3a2c']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.mapMeDot} />
              <View style={styles.mapRoute} />
              <View style={styles.mapPin}>
                <Ionicons name="location" size={16} color="#fff" />
              </View>
              <View style={styles.mapAddress}>
                <Ionicons name="location-outline" size={14} color={palette.ink.onLightStrong} />
                <Text style={styles.mapAddressText} numberOfLines={1}>
                  {place.address}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={palette.ink.onLightSubtle} />
              </View>
            </Pressable>

            {/* About */}
            <SectionTitle>About</SectionTitle>
            <Text style={styles.aboutText}>{place.about}</Text>

            {/* Hours */}
            <Pressable onPress={() => setHoursOpen((s) => !s)} style={styles.hoursToggle}>
              <Ionicons name="time-outline" size={16} color={palette.ink.onLightStrong} />
              <Text style={styles.hoursTitle}>
                {place.open ? `Open until ${place.closesAt}` : 'Closed'}
              </Text>
              <Ionicons
                name={hoursOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={palette.ink.onLightSubtle}
              />
            </Pressable>
            {hoursOpen ? (
              <View style={styles.hoursList}>
                {place.hours.map((h) => (
                  <View key={h.day} style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>{h.day}</Text>
                    <Text style={styles.hoursValue}>{h.hours}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Photos */}
            <SectionTitle>Photos</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}>
              {place.photos.map((p, i) => (
                <Image key={i} source={p} style={styles.photoTile} contentFit="cover" />
              ))}
            </ScrollView>

            {/* Products */}
            <SectionTitle>Products & services</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productRow}>
              {place.products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onPress={() => router.push(`/product/${p.id}` as never)}
                  onRepost={() =>
                    setRepostTarget({
                      id: p.id,
                      name: p.name,
                      price: fmt(p.price),
                      vendor: place.name,
                      vendorId: place.handle,
                    })
                  }
                />
              ))}
            </ScrollView>

            {/* Comments / Reviews */}
            <View style={styles.reviewsHead}>
              <Text style={styles.sectionTitle}>Comments</Text>
              <Pressable hitSlop={8}>
                <Text style={styles.reviewsLink}>See all</Text>
              </Pressable>
            </View>
            {place.reviewsList.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{r.author[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <View style={styles.reviewMeta}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name="star"
                          size={11}
                          color={s <= r.rating ? palette.brand.amber : palette.line.divider}
                        />
                      ))}
                      <Text style={styles.reviewAge}>· {r.age}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            ))}

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </SafeAreaView>

      <RepostSheet
        visible={repostTarget !== null}
        onClose={() => setRepostTarget(null)}
        product={
          repostTarget ?? {
            id: '',
            name: '',
            price: '',
            vendor: '',
            vendorId: '',
          }
        }
      />
    </EspressoBackground>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function ProductCard({
  product,
  onPress,
  onRepost,
}: {
  product: { id: string; name: string; price: number; image: any };
  onPress: () => void;
  onRepost: () => void;
}) {
  const reposted = useIsReposted(product.id);
  return (
    <Pressable onPress={onPress} style={styles.productCard}>
      <View style={styles.productImageWrap}>
        <Image source={product.image} style={styles.productImage} contentFit="cover" />
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onRepost();
          }}
          hitSlop={8}
          accessibilityLabel={reposted ? 'Reposted' : 'Repost'}
          style={[styles.repostBtn, reposted && styles.repostBtnOn]}>
          <Ionicons
            name="repeat"
            size={14}
            color={reposted ? '#fff' : palette.brand.orange}
          />
        </Pressable>
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>₦{product.price.toLocaleString('en-NG')}</Text>
    </Pressable>
  );
}

function ActionBtn({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionBtn}>
      <View style={[styles.actionIcon, primary && styles.actionIconPrimary]}>
        <Ionicons name={icon} size={18} color={primary ? '#fff' : palette.brand.orange} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },
  heroWrap: { height: 280, position: 'relative' },
  hero: { width: '100%', height: '100%' },
  heroOverlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 110 },
  heroTopBar: {
    position: 'absolute',
    top: spacing['2'],
    left: spacing['4'],
    right: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDots: {
    position: 'absolute',
    bottom: spacing['3'],
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  heroDotOn: { backgroundColor: '#fff', width: 18 },
  body: { paddingHorizontal: spacing['4'], paddingTop: spacing['4'] },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...typography.h2, color: palette.ink.onLightStrong },
  verifyBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    marginTop: 2,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['2'],
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(216, 149, 68, 0.14)',
  },
  rankText: {
    ...typography.small,
    color: palette.brand.orangeDeep,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing['3'],
  },
  metaStrong: {
    ...typography.body,
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  metaMuted: { ...typography.caption, color: palette.ink.onLightSubtle },
  metaDot: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginHorizontal: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['2'],
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOpen: { backgroundColor: palette.status.success },
  statusDotClosed: { backgroundColor: palette.status.danger },
  statusText: { ...typography.caption, fontFamily: typography.bodyEmphasis.fontFamily },
  statusOpen: { color: palette.status.success },
  statusClosed: { color: palette.status.danger },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing['5'],
    paddingBottom: spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  actionBtn: { alignItems: 'center', gap: 6, flex: 1 },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 149, 68, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconPrimary: { backgroundColor: palette.brand.orange },
  actionLabel: {
    ...typography.small,
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  mapPreview: {
    height: 140,
    marginTop: spacing['5'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#1f3a2c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMeDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5BA8E8',
    borderWidth: 2,
    borderColor: '#fff',
    left: '22%',
    top: '60%',
  },
  mapRoute: {
    position: 'absolute',
    width: '45%',
    height: 2,
    backgroundColor: palette.brand.orange,
    transform: [{ rotate: '-22deg' }],
    left: '28%',
    top: '52%',
  },
  mapPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  mapAddress: {
    position: 'absolute',
    left: spacing['3'],
    right: spacing['3'],
    bottom: spacing['3'],
    backgroundColor: '#fff',
    borderRadius: radius.md,
    paddingHorizontal: spacing['3'],
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapAddressText: {
    flex: 1,
    ...typography.caption,
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onLightStrong,
    marginTop: spacing['5'],
    marginBottom: spacing['3'],
  },
  aboutText: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    lineHeight: 22,
  },
  hoursToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing['3'],
    marginTop: spacing['4'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  hoursTitle: {
    ...typography.body,
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
    flex: 1,
  },
  hoursList: { paddingBottom: spacing['3'] },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hoursDay: {
    ...typography.body,
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
    width: 50,
  },
  hoursValue: { ...typography.body, color: palette.ink.onLightSubtle },
  photoRow: { gap: spacing['2'] },
  photoTile: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  productRow: { gap: spacing['3'] },
  productCard: { width: 150 },
  productImageWrap: {
    width: '100%',
    height: 150,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing['2'],
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  repostBtn: {
    position: 'absolute',
    top: spacing['2'],
    right: spacing['2'],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repostBtnOn: {
    backgroundColor: palette.brand.orange,
  },
  productName: {
    ...typography.body,
    color: palette.ink.onLightStrong,
  },
  productPrice: {
    ...typography.bodyEmphasis,
    color: palette.brand.orangeDeep,
    marginTop: 2,
  },
  reviewsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewsLink: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    marginTop: spacing['5'],
  },
  reviewCard: {
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitial: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  reviewAuthor: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  reviewAge: {
    ...typography.small,
    color: palette.ink.onLightSubtle,
    marginLeft: 4,
  },
  reviewText: {
    ...typography.body,
    color: palette.ink.onLightSubtle,
    marginTop: spacing['2'],
    lineHeight: 22,
  },
});
