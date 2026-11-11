import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import {
  useAddresses,
  useDeleteAddress,
  useUpdateAddress,
} from '@/src/api/account/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function AddressesScreen() {
  const { data: addresses = [], isLoading, isError, refetch, isFetching } = useAddresses();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Saved addresses" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={palette.brand.orange} />
            <Text style={styles.emptySubtitle}>Loading saved addresses…</Text>
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={36} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyTitle}>Couldn&apos;t load addresses</Text>
            <Pressable onPress={() => refetch()} disabled={isFetching}>
              <Text style={styles.makeDefaultText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
            </Pressable>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={36} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptySubtitle}>Add a delivery address to speed up checkout.</Text>
          </View>
        ) : (
          addresses.map((a) => (
            <View key={a.id} style={[styles.card, a.isDefault && styles.cardDefault]}>
              <View style={styles.cardHead}>
                <View style={styles.labelRow}>
                  <Ionicons name="home" size={16} color={palette.brand.orange} />
                  <Text style={styles.label}>{a.label}</Text>
                  {a.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  ) : null}
                </View>
                <Pressable
                  hitSlop={8}
                  disabled={deleteAddress.isPending}
                  onPress={() => deleteAddress.mutate(a.id)}>
                  <Ionicons name="trash-outline" size={16} color={palette.ink.onDarkMuted} />
                </Pressable>
              </View>
              <Text style={styles.recipient}>{a.recipient}</Text>
              <Text style={styles.line}>{a.street}, {a.city}, {a.state}</Text>
              <Text style={styles.line}>{a.phone}</Text>
              {!a.isDefault ? (
                <Pressable
                  disabled={updateAddress.isPending}
                  onPress={() => updateAddress.mutate({ id: a.id, input: { isDefault: true } })}
                  style={({ pressed }) => [
                    styles.makeDefault,
                    pressed && { opacity: 0.85 },
                    updateAddress.isPending && { opacity: 0.5 },
                  ]}>
                  <Text style={styles.makeDefaultText}>Make default</Text>
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="+ Add address" onPress={() => router.push('/account/addresses/add')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: spacing['3'], gap: spacing['3'], paddingBottom: 40 },
  empty: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: spacing['2'],
  },
  emptyTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  emptySubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  card: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 4,
  },
  cardDefault: {
    borderColor: 'rgba(232, 93, 63,0.40)',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 93, 63,0.16)',
    marginLeft: 4,
  },
  defaultText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    color: palette.brand.orange,
  },
  recipient: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
    marginTop: 4,
  },
  line: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  makeDefault: {
    alignSelf: 'flex-start',
    paddingTop: 4,
  },
  makeDefaultText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  actions: { paddingVertical: spacing['3'] },
});
