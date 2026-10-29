import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { useCart, useCartTotal } from '@/src/store/cart';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function CartScreen() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const total = useCartTotal();

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Your Cart" showBack />

      {lines.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyBubble}>
            <Ionicons name="bag-outline" size={48} color={palette.ink.onDarkMuted} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Browse the shop and add items you love.</Text>
          <View style={styles.emptyAction}>
            <PrimaryButton label="Start shopping" onPress={() => router.replace('/(home-feed)/(tabs)/shop' as never)} />
          </View>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {lines.map((l) => (
              <View key={l.id + (l.color ?? '')} style={styles.row}>
                <Image source={l.image as any} style={styles.thumb} contentFit="cover" />
                <View style={styles.rowBody}>
                  <Text style={styles.name} numberOfLines={2}>{l.name}</Text>
                  <Text style={styles.vendor}>{l.vendor}{l.color ? ` · ${l.color}` : ''}</Text>
                  <View style={styles.rowFooter}>
                    <Text style={styles.price}>₦{l.price.toLocaleString()}</Text>
                    <View style={styles.qty}>
                      <Pressable onPress={() => setQuantity(l.id, l.quantity - 1, l.color)} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={14} color={palette.ink.onDarkStrong} />
                      </Pressable>
                      <Text style={styles.qtyValue}>{l.quantity}</Text>
                      <Pressable onPress={() => setQuantity(l.id, l.quantity + 1, l.color)} style={styles.qtyBtn}>
                        <Ionicons name="add" size={14} color={palette.ink.onDarkStrong} />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <Pressable onPress={() => remove(l.id, l.color)} hitSlop={8} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={16} color={palette.ink.onDarkMuted} />
                </Pressable>
              </View>
            ))}

            <View style={styles.summary}>
              <SummaryRow label="Subtotal" value={`₦${total.toLocaleString()}`} />
              <SummaryRow label="Delivery" value="₦4,300" />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={`₦${(total + 4300).toLocaleString()}`} emphasized />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <PrimaryButton label="Checkout" onPress={() => router.push('/checkout')} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

function SummaryRow({ label, value, emphasized }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized && styles.summaryLabelStrong]}>{label}</Text>
      <Text style={[styles.summaryValue, emphasized && styles.summaryValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['5'],
    gap: spacing['3'],
  },
  emptyBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    color: palette.ink.onDarkStrong,
  },
  emptySubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  emptyAction: {
    width: '100%',
    marginTop: spacing['4'],
  },
  list: { paddingBottom: spacing['8'], gap: spacing['3'] },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(40, 26, 16, 0.18)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 3,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  rowBody: { flex: 1, gap: 4 },
  name: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  vendor: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 999,
    paddingHorizontal: spacing['1'],
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    minWidth: 16,
    textAlign: 'center',
    color: palette.ink.onDarkStrong,
  },
  trashBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    paddingTop: spacing['4'],
    gap: spacing['2'],
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkSoft,
  },
  summaryLabelStrong: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    color: palette.ink.onDarkStrong,
  },
  summaryValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  summaryValueStrong: {
    fontSize: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    marginVertical: spacing['1'],
  },
  actions: { paddingVertical: spacing['3'] },
});
