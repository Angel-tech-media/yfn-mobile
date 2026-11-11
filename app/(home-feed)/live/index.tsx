import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useMarketplaceHome } from '@/src/api/marketplace/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LiveMarketplaceScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useMarketplaceHome();

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.title}>Live marketplace</Text>
          <Pressable
            hitSlop={8}
            onPress={() => router.push('/live/nearby' as never)}
            style={styles.iconBtn}>
            <Ionicons name="location" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <Text style={styles.eyebrow}>
          Ranked by proximity · trust · momentum · freshness
        </Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.brand.orange} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Couldn't reach the backend.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={data?.products ?? []}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.list}
            refreshing={isFetching}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/live/p/${item.id}` as never)}
                style={styles.card}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="image"
                    size={28}
                    color="rgba(255,255,255,0.25)"
                  />
                  {item.isYfnVerified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={11} color="#fff" />
                      <Text style={styles.verifiedText}>Aktive</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardCategory} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={styles.cardPrice}>
                    ₦{(item.price / 100).toLocaleString('en-NG')}
                  </Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No products in the ranked feed yet.</Text>
              </View>
            }
          />
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
    paddingTop: spacing['2'],
    paddingBottom: spacing['1'],
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
  eyebrow: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['3'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['6'],
  },
  errorText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
  },
  emptyText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
  },
  retryBtn: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  list: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['8'],
    gap: spacing['3'],
  },
  card: {
    flexDirection: 'row',
    gap: spacing['3'],
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line.onDark,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 999,
    backgroundColor: palette.status.success,
  },
  verifiedText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  cardBody: {
    flex: 1,
    padding: spacing['3'],
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  cardCategory: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
  },
  cardPrice: {
    ...typography.h2,
    fontSize: 18,
    color: palette.brand.orange,
    marginTop: 4,
  },
});
