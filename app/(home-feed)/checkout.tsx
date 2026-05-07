import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RadioRow } from '@/components/ui/RadioRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useCart, useCartTotal } from '@/src/store/cart';
import { palette, radius, spacing, typography } from '@/src/theme';

const PROMOS: Record<string, number> = {
  VIBE10: 0.1,
  WELCOME: 0.05,
  FREESHIP: 0,
};

type Pay = 'card' | 'transfer' | 'cod';

const PAYMENT_METHODS: Array<{ key: Pay; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'card', label: 'Card payment', icon: 'card-outline' },
  { key: 'transfer', label: 'Bank transfer', icon: 'swap-horizontal-outline' },
  { key: 'cod', label: 'Cash on delivery', icon: 'cash-outline' },
];

export default function CheckoutScreen() {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pay, setPay] = useState<Pay>('card');
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = useCartTotal();
  const clear = useCart((s) => s.clear);

  const subtotal = total > 0 ? total : 175000; // demo fallback when cart empty
  const deliveryFee = appliedPromo === 'FREESHIP' ? 0 : 4300;
  const promoDiscount = appliedPromo
    ? Math.round((PROMOS[appliedPromo] ?? 0) * subtotal)
    : 0;
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const finalTotal = subtotal - promoDiscount + deliveryFee + tax;

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code in PROMOS) {
      setAppliedPromo(code);
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid promo code');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromo('');
    setPromoError(null);
  };

  const placeOrder = () => {
    setSubmitting(true);
    setTimeout(() => {
      clear();
      setSubmitting(false);
      router.replace('/order-confirmed');
    }, 800);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Checkout" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <View style={styles.form}>
          <TextField placeholder="Full address" value={address} onChangeText={setAddress} />
          <TextField placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.list}>
          {PAYMENT_METHODS.map((p) => (
            <RadioRow
              key={p.key}
              label={p.label}
              selected={pay === p.key}
              onPress={() => setPay(p.key)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Promo code</Text>
        {appliedPromo ? (
          <View style={styles.promoApplied}>
            <View style={styles.promoTagWrap}>
              <Ionicons name="pricetag" size={14} color={palette.brand.orange} />
              <Text style={styles.promoTagText}>{appliedPromo}</Text>
              <Text style={styles.promoTagSub}>
                {appliedPromo === 'FREESHIP' ? 'Free delivery' : `${(PROMOS[appliedPromo] * 100).toFixed(0)}% off`}
              </Text>
            </View>
            <Pressable onPress={removePromo} hitSlop={8}>
              <Ionicons name="close" size={18} color={palette.ink.onDarkSoft} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.promoRow}>
            <View style={{ flex: 1 }}>
              <TextField
                placeholder="Enter promo code"
                value={promo}
                onChangeText={(t) => {
                  setPromo(t.toUpperCase());
                  setPromoError(null);
                }}
                autoCapitalize="characters"
                error={promoError ?? undefined}
              />
            </View>
            <Pressable
              onPress={applyPromo}
              disabled={!promo.trim()}
              style={({ pressed }) => [
                styles.applyBtn,
                !promo.trim() && { opacity: 0.5 },
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={styles.applyLabel}>Apply</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.summary}>
          <SummaryRow label="Subtotal" value={`₦${subtotal.toLocaleString()}`} />
          {promoDiscount > 0 ? (
            <SummaryRow label={`Promo (${appliedPromo})`} value={`-₦${promoDiscount.toLocaleString()}`} tone="negative" />
          ) : null}
          <SummaryRow label="Delivery fee" value={deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`} />
          <SummaryRow label="Tax" value={`₦${tax.toLocaleString()}`} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={`₦${finalTotal.toLocaleString()}`} emphasized />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label={`Place order — ₦${finalTotal.toLocaleString()}`}
          loading={submitting}
          disabled={!address || !phone}
          onPress={placeOrder}
        />
      </View>
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  emphasized,
  tone,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  tone?: 'negative';
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized && styles.summaryLabelStrong]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          emphasized && styles.summaryValueStrong,
          tone === 'negative' && { color: palette.brand.orange },
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing['8'] },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
    marginTop: spacing['4'],
    marginBottom: spacing['2'],
  },
  form: { gap: spacing['3'] },
  list: { gap: spacing['2'] },
  promoRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    alignItems: 'flex-start',
  },
  applyBtn: {
    height: 56,
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
  applyLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  promoApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(253,134,22,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(253,134,22,0.40)',
  },
  promoTagWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promoTagText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  promoTagSub: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
    marginLeft: 6,
  },
  summary: {
    marginTop: spacing['4'],
    paddingTop: spacing['4'],
    gap: spacing['2'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.20)',
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
  summaryValueStrong: { fontSize: 18 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.20)',
    marginVertical: spacing['1'],
  },
  actions: { paddingVertical: spacing['3'] },
});
