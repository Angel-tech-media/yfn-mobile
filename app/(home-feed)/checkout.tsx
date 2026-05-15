import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import {
  PLATFORM_FEE_EXPLAINER,
  PLATFORM_FEE_LABEL,
  computePlatformFee,
} from '@/src/config/fees';
import { useCart, useCartTotal } from '@/src/store/cart';
import { useOrders } from '@/src/store/orders';
import { useWallet } from '@/src/store/wallet';
import { palette, radius, spacing, typography } from '@/src/theme';

const PROMOS: Record<string, number> = {
  VIBE10: 0.1,
  WELCOME: 0.05,
  FREESHIP: 0,
};

const fmt = (n: number) => '₦' + n.toLocaleString('en-NG');

export default function CheckoutScreen() {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const total = useCartTotal();
  const clear = useCart((s) => s.clear);
  const balance = useWallet((s) => s.balance);
  const payFromWallet = useWallet((s) => s.payFromWallet);
  const lines = useCart((s) => s.lines);

  const subtotal = total > 0 ? total : 175000; // demo fallback when cart empty
  const deliveryFee = appliedPromo === 'FREESHIP' ? 0 : 4300;
  const promoDiscount = appliedPromo
    ? Math.round((PROMOS[appliedPromo] ?? 0) * subtotal)
    : 0;
  const platformFee = useMemo(
    () => computePlatformFee(subtotal - promoDiscount),
    [subtotal, promoDiscount],
  );
  const finalTotal = subtotal - promoDiscount + deliveryFee + platformFee;

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

  const addOrder = useOrders((s) => s.add);

  const placeOrder = () => {
    setSubmitting(true);
    setPayError(null);
    setTimeout(() => {
      const vendor = lines[0]?.vendor ?? 'Vendor';
      const orderId = `ord-${Date.now().toString().slice(-6)}`;
      const result = payFromWallet({ amount: finalTotal, orderId, vendor });
      setSubmitting(false);
      if (!result.ok) {
        setPayError(
          `Not enough in your eWallet. You need ${fmt(finalTotal - balance)} more — top up to continue.`,
        );
        return;
      }
      addOrder({
        id: orderId,
        vendor,
        vendorHandle: vendor.toLowerCase().replace(/['\s]+/g, ''),
        items: lines.map((l) => ({ name: l.name, qty: l.quantity, unit: l.price })),
      });
      clear();
      router.replace('/order-confirmed');
    }, 600);
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

        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.walletPayCard}>
          <LinearGradient
            colors={[palette.brand.orange, palette.brand.orangeDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.walletPayHeader}>
            <View style={styles.walletPayIcon}>
              <Ionicons name="wallet" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.walletPayLabel}>Pay from eWallet</Text>
              <Text style={styles.walletPayAvail}>
                Available · {fmt(balance)}
              </Text>
            </View>
            <View style={styles.walletPayCheck}>
              <Ionicons name="checkmark" size={14} color={palette.brand.orange} />
            </View>
          </View>
          <Text style={styles.walletPayNote}>
            Funds leave your eWallet into Vibe escrow. The vendor is notified but
            the money only releases to them when you confirm delivery.
          </Text>
          {balance < finalTotal ? (
            <Pressable
              onPress={() => router.push('/(tabs)/wallet' as never)}
              style={styles.walletPayTopUp}>
              <Ionicons name="add-circle" size={14} color="#fff" />
              <Text style={styles.walletPayTopUpLabel}>
                Top up — need {fmt(finalTotal - balance)} more
              </Text>
            </Pressable>
          ) : null}
        </View>
        {payError ? (
          <View style={styles.payErrorRow}>
            <Ionicons name="alert-circle" size={14} color={palette.status.danger} />
            <Text style={styles.payErrorText}>{payError}</Text>
          </View>
        ) : null}

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
          <SummaryRow
            label={PLATFORM_FEE_LABEL}
            value={`₦${platformFee.toLocaleString()}`}
          />
          <Text style={styles.feeFootnote}>{PLATFORM_FEE_EXPLAINER}</Text>
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
  walletPayCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    gap: spacing['2'],
    shadowColor: palette.brand.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  walletPayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  walletPayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPayLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: '#fff',
  },
  walletPayAvail: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  walletPayCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPayNote: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 6,
  },
  walletPayTopUp: {
    marginTop: spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  walletPayTopUpLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#fff',
  },
  payErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(244,67,54,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.30)',
  },
  payErrorText: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: palette.status.danger,
  },
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
    backgroundColor: 'rgba(216, 149, 68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.40)',
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
    borderTopColor: 'rgba(0, 0, 0, 0.10)',
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
  feeFootnote: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
    color: palette.ink.onDarkMuted,
    marginTop: -2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    marginVertical: spacing['1'],
  },
  actions: { paddingVertical: spacing['3'] },
});
