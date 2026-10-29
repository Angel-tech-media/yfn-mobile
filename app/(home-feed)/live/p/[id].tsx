import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useStartConversation } from '@/src/hooks/use-chat';
import { useProduct } from '@/src/hooks/use-marketplace';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LiveProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = String(id);
  const { data: product, isLoading, isError } = useProduct(productId);
  const startConv = useStartConversation();

  const messageVendor = () => {
    if (!product) return;
    startConv.mutate(
      { participantUserId: product.vendor.userId, productId: product.id },
      {
        onSuccess: (conv) => router.push(`/threads/${conv.id}` as never),
      },
    );
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.title}>Product</Text>
          <View style={styles.iconBtn} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.brand.orange} />
          </View>
        ) : isError || !product ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Couldn't load this product.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Ionicons name="image" size={48} color="rgba(255,255,255,0.2)" />
              {product.isYfnVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#fff" />
                  <Text style={styles.verifiedText}>YFN-verified</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.body}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.category}>{product.category}</Text>
              <Text style={styles.price}>
                ₦{(product.price / 100).toLocaleString('en-NG')}
              </Text>

              {typeof product.distanceKm === 'number' ? (
                <View style={styles.distanceRow}>
                  <Ionicons name="location" size={14} color={palette.brand.orange} />
                  <Text style={styles.distanceText}>
                    {product.distanceKm.toFixed(2)} km away
                  </Text>
                </View>
              ) : null}

              <Text style={styles.description}>{product.description}</Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={messageVendor}
                  disabled={startConv.isPending}
                  style={[styles.secondaryBtn, startConv.isPending && { opacity: 0.6 }]}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={16}
                    color={palette.ink.onDarkStrong}
                  />
                  <Text style={styles.secondaryBtnText}>
                    {startConv.isPending ? 'Opening…' : 'Message vendor'}
                  </Text>
                </Pressable>
                <Pressable style={styles.primaryBtn}>
                  <Ionicons name="bag" size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>Add to cart</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
  },
  errorText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
  },
  scroll: {
    paddingBottom: spacing['8'],
  },
  hero: {
    height: 280,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing['3'],
    left: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 999,
    backgroundColor: palette.status.success,
  },
  verifiedText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  body: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
    gap: spacing['2'],
  },
  productTitle: {
    ...typography.h2,
    color: palette.ink.onDarkStrong,
  },
  category: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  price: {
    ...typography.h2,
    color: palette.brand.orange,
    marginTop: spacing['1'],
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing['1'],
  },
  distanceText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
  },
  description: {
    ...typography.body,
    color: palette.ink.onDarkSoft,
    marginTop: spacing['3'],
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['4'],
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: palette.brand.orange,
  },
  primaryBtnText: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line.onDark,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryBtnText: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
});
