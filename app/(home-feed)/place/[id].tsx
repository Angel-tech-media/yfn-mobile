import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { useFollowVendor, useVendor, useVendorProducts, useVendorReviews } from '@/src/api/vendors/hooks';
import { useStartConversation } from '@/src/api/chat/hooks';
import type { RankedProduct } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const handle = String(id ?? '');
  const { data: vendor, isError, isLoading, refetch } = useVendor(handle);
  const { data: products = [] } = useVendorProducts(handle);
  const { data: reviews = [] } = useVendorReviews(handle);
  const followVendor = useFollowVendor();
  const startConversation = useStartConversation();
  const heroUrl = vendor?.photos?.[0];

  const handleMessageVendor = () => {
    if (!vendor?.userId) return;
    startConversation.mutate(
      { participantUserId: vendor.userId },
      {
        onSuccess: (conv) => {
          router.push(`/threads/${conv.id}` as never);
        },
      }
    );
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        {isLoading ? (
          <StateView label="Loading place..." />
        ) : isError || !vendor ? (
          <StateView label="Could not load this place." onRetry={() => refetch()} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.heroWrap}>
              {heroUrl ? (
                <Image source={{ uri: heroUrl }} style={styles.hero} contentFit="cover" />
              ) : (
                <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.hero} />
              )}
              <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent']} style={styles.heroOverlayTop} />
              <View style={styles.heroTopBar}>
                <PressableScale
                  onPress={() => router.back()}
                  accessibilityLabel="Back"
                  haptic="light"
                  scaleTo={0.9}
                  style={styles.heroIconBtn}>
                  <Ionicons name="chevron-back" size={20} color="#fff" />
                </PressableScale>
                <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                  <PressableScale
                    accessibilityLabel="Save"
                    haptic="selection"
                    scaleTo={0.9}
                    style={styles.heroIconBtn}>
                    <Ionicons name="bookmark-outline" size={18} color="#fff" />
                  </PressableScale>
                  <PressableScale
                    accessibilityLabel="Share"
                    haptic="light"
                    scaleTo={0.9}
                    style={styles.heroIconBtn}>
                    <Ionicons name="share-outline" size={18} color="#fff" />
                  </PressableScale>
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{vendor.storeName || vendor.name}</Text>
                    {vendor.verified ? (
                      <View style={styles.verifyBadge}>
                        <Ionicons name="shield-checkmark" size={11} color="#fff" />
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.subtitle}>{vendor.category}</Text>
                </View>
                {vendor.rank ? (
                  <View style={styles.rankPill}>
                    <Ionicons name="trophy" size={12} color={palette.brand.orange} />
                    <Text style={styles.rankText}>{vendor.rank}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.metaRow}>
                <Meta icon="star" text={`${vendor.rating.toFixed(1)} (${vendor.reviews})`} />
                {typeof vendor.distance === 'number' ? <Meta icon="navigate" text={`${vendor.distance.toFixed(1)} km`} /> : null}
                <Meta icon={vendor.open ? 'time' : 'moon'} text={vendor.open ? `Open${vendor.closesAt ? ` until ${vendor.closesAt}` : ''}` : 'Closed'} />
              </View>

              <View style={styles.actions}>
                <PressableScale
                  onPress={() => followVendor.mutate(vendor.handle)}
                  disabled={followVendor.isPending}
                  haptic="medium"
                  scaleTo={0.94}
                  style={[styles.actionBtn, styles.actionPrimary]}>
                  <Ionicons name={vendor.isFollowing ? 'checkmark' : 'add'} size={16} color="#fff" />
                  <Text style={styles.actionPrimaryText}>
                    {vendor.isFollowing ? 'Following' : followVendor.isPending ? 'Following...' : 'Follow'}
                  </Text>
                </PressableScale>
                <PressableScale
                  onPress={handleMessageVendor}
                  disabled={startConversation.isPending || !vendor.userId}
                  haptic="medium"
                  scaleTo={0.94}
                  style={styles.actionBtn}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={palette.ink.onDarkStrong} />
                  <Text style={styles.actionText}>
                    {startConversation.isPending ? 'Opening...' : 'Message'}
                  </Text>
                </PressableScale>
                {vendor.phone ? (
                  <PressableScale
                    haptic="light"
                    scaleTo={0.94}
                    style={styles.actionBtn}>
                    <Ionicons name="call-outline" size={16} color={palette.ink.onDarkStrong} />
                    <Text style={styles.actionText}>Call</Text>
                  </PressableScale>
                ) : null}
              </View>

              {vendor.about ? (
                <Section title="About">
                  <Text style={styles.bodyText}>{vendor.about}</Text>
                </Section>
              ) : null}

              {vendor.address ? (
                <Section title="Location">
                  <Text style={styles.bodyText}>{vendor.address}</Text>
                </Section>
              ) : null}

              {vendor.hours?.length ? (
                <Section title="Hours">
                  {vendor.hours.map((item) => (
                    <View key={item.day} style={styles.hoursRow}>
                      <Text style={styles.hoursDay}>{item.day}</Text>
                      <Text style={styles.hoursText}>{item.hours}</Text>
                    </View>
                  ))}
                </Section>
              ) : null}

              <Section title="Products">
                {products.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsRow}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.bodyText}>No products listed yet.</Text>
                )}
              </Section>

              <Section title="Reviews">
                {reviews.length ? (
                  reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewAuthor}>{review.author}</Text>
                        <Text style={styles.reviewRating}>{review.rating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.reviewText}>{review.text}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.bodyText}>No reviews yet.</Text>
                )}
              </Section>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </EspressoBackground>
  );
}

function StateView({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.stateText}>{label}</Text>
      {onRetry ? (
        <PressableScale onPress={onRetry} haptic="medium" style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={13} color={palette.brand.orange} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function ProductCard({ product }: { product: RankedProduct }) {
  const imageUrl = product.media?.find((media) => media.type === 'image')?.url;

  return (
    <PressableScale
      onPress={() => router.push(`/product/${product.id}` as never)}
      haptic="light"
      scaleTo={0.96}
      style={styles.productCard}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#3a2818', '#1f1108']} style={styles.productImage} />
      )}
      <Text style={styles.productName} numberOfLines={2}>{product.title}</Text>
      <Text style={styles.productPrice}>{formatKobo(product.price)}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  stateText: { ...typography.body, color: palette.ink.onDarkSoft },
  retryBtn: {
    height: 36,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 260 },
  heroOverlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  heroTopBar: {
    position: 'absolute',
    top: spacing['3'],
    left: spacing['4'],
    right: spacing['4'],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing['4'], gap: spacing['4'] },
  titleRow: { flexDirection: 'row', gap: spacing['3'], alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  name: { ...typography.h2, color: palette.ink.onDarkStrong, flexShrink: 1 },
  subtitle: { ...typography.body, color: palette.ink.onDarkMuted, marginTop: 2 },
  verifyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['2'],
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(47, 107, 255,0.16)',
  },
  rankText: { ...typography.small, color: palette.brand.orange, fontFamily: typography.bodyEmphasis.fontFamily },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  metaText: { ...typography.caption, color: palette.ink.onDarkStrong },
  actions: { flexDirection: 'row', gap: spacing['2'] },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
  },
  actionPrimary: { backgroundColor: palette.brand.orange, borderColor: palette.brand.orange },
  actionText: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  actionPrimaryText: { ...typography.bodyEmphasis, color: '#fff' },
  section: { gap: spacing['2'] },
  sectionTitle: { ...typography.title, color: palette.ink.onDarkStrong },
  bodyText: { ...typography.body, color: palette.ink.onDarkSoft },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing['4'] },
  hoursDay: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  hoursText: { ...typography.body, color: palette.ink.onDarkSoft },
  productsRow: { gap: spacing['3'], paddingRight: spacing['4'] },
  productCard: { width: 150, gap: spacing['2'] },
  productImage: { width: '100%', aspectRatio: 1, borderRadius: radius.md },
  productName: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  productPrice: { ...typography.bodyEmphasis, color: palette.brand.orange },
  reviewCard: {
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    gap: spacing['1'],
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing['2'] },
  reviewAuthor: { ...typography.bodyEmphasis, color: palette.ink.onDarkStrong },
  reviewRating: { ...typography.bodyEmphasis, color: palette.brand.orange },
  reviewText: { ...typography.body, color: palette.ink.onDarkSoft },
});
