import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useAccount, type PaymentMethod } from '@/src/store/account';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function PaymentMethodsScreen() {
  const methods = useAccount((s) => s.paymentMethods);
  const setDefault = useAccount((s) => s.setDefaultPayment);
  const remove = useAccount((s) => s.removePayment);

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Payment methods" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {methods.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={36} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyTitle}>No saved methods</Text>
            <Text style={styles.emptySubtitle}>Add a card or wallet to speed up checkout.</Text>
          </View>
        ) : (
          methods.map((m) => <Card key={m.id} m={m} onSetDefault={setDefault} onRemove={remove} />)
        )}
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton label="+ Add payment method" onPress={() => router.push('/account/payment-methods/add')} />
      </View>
    </ScreenContainer>
  );
}

function Card({ m, onSetDefault, onRemove }: { m: PaymentMethod; onSetDefault: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <View style={[styles.card, m.isDefault && styles.cardDefault]}>
      <View style={styles.cardHead}>
        <View style={styles.brandWrap}>
          {m.type === 'card' ? (
            <Ionicons name="card" size={20} color={palette.brand.orange} />
          ) : m.type === 'transfer' ? (
            <Ionicons name="swap-horizontal" size={20} color={palette.brand.orange} />
          ) : (
            <Ionicons name="wallet" size={20} color={palette.brand.orange} />
          )}
          <Text style={styles.label}>{m.label}</Text>
        </View>
        <Pressable hitSlop={8} onPress={() => onRemove(m.id)}>
          <Ionicons name="trash-outline" size={16} color={palette.ink.onDarkMuted} />
        </Pressable>
      </View>
      {m.type === 'card' && m.last4 ? (
        <Text style={styles.cardNumber}>•••• •••• •••• {m.last4}</Text>
      ) : null}
      <View style={styles.cardFoot}>
        {m.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        ) : (
          <Pressable onPress={() => onSetDefault(m.id)} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <Text style={styles.makeDefaultText}>Make default</Text>
          </Pressable>
        )}
      </View>
    </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: spacing['2'],
  },
  cardDefault: {
    borderColor: 'rgba(216, 149, 68,0.40)',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  cardNumber: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkSoft,
    letterSpacing: 2,
  },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(216, 149, 68,0.16)',
  },
  defaultText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 10,
    color: palette.brand.orange,
  },
  makeDefaultText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  actions: { paddingVertical: spacing['3'] },
});
