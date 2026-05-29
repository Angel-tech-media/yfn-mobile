import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useDeviceLocation } from '@/src/hooks/use-device-location';
import { useNearby } from '@/src/hooks/use-marketplace';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LiveNearbyScreen() {
  const [radiusKm, setRadiusKm] = useState(10);
  const [sortBy, setSortBy] = useState<'relevance' | 'distance'>('distance');
  const location = useDeviceLocation();

  const { data, isLoading, isError, refetch, isFetching } = useNearby({
    lat: location.lat,
    lng: location.lng,
    radiusKm,
    sortBy,
  });

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.title}>Closest to you</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.controls}>
          <View style={styles.chipRow}>
            {([5, 10, 25] as const).map((km) => (
              <Pressable
                key={km}
                onPress={() => setRadiusKm(km)}
                style={[styles.chip, radiusKm === km && styles.chipOn]}>
                <Text style={[styles.chipText, radiusKm === km && styles.chipTextOn]}>
                  {km} km
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setSortBy('distance')}
              style={[styles.chip, sortBy === 'distance' && styles.chipOn]}>
              <Text style={[styles.chipText, sortBy === 'distance' && styles.chipTextOn]}>
                Closest
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSortBy('relevance')}
              style={[styles.chip, sortBy === 'relevance' && styles.chipOn]}>
              <Text style={[styles.chipText, sortBy === 'relevance' && styles.chipTextOn]}>
                Best match
              </Text>
            </Pressable>
          </View>
        </View>

        {typeof data?.query?.matched === 'number' ? (
          <Text style={styles.matched}>
            {data.query.matched} result{data.query.matched === 1 ? '' : 's'} within{' '}
            {radiusKm} km
          </Text>
        ) : null}

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
                style={styles.row}>
                <View style={styles.thumb}>
                  <Ionicons name="image" size={20} color="rgba(255,255,255,0.25)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>
                      ₦{(item.price / 100).toLocaleString('en-NG')}
                    </Text>
                    {typeof item.distanceKm === 'number' ? (
                      <View style={styles.distancePill}>
                        <Ionicons name="location" size={10} color="#fff" />
                        <Text style={styles.distancePillText}>
                          {item.distanceKm.toFixed(2)} km
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.errorText}>
                  Nothing within {radiusKm} km. Try a larger radius.
                </Text>
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
  controls: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    gap: spacing['2'],
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  chip: {
    paddingHorizontal: spacing['3'],
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
  chipText: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  chipTextOn: { color: '#fff' },
  matched: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
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
    textAlign: 'center',
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
    gap: spacing['2'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  itemMeta: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: 4,
  },
  itemPrice: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  distancePillText: {
    ...typography.small,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
});
