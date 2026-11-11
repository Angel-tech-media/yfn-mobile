import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { DopamineCelebrationModal } from '@/components/ui/DopamineCelebrationModal';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useCreateOrder } from '@/src/api/orders/hooks';
import { usePayFromWallet, useTopUpWallet, useWallet } from '@/src/api/wallet/hooks';
import {
  PLATFORM_FEE_LABEL,
  computePlatformFee,
} from '@/src/config/fees';
import { vibeHaptics } from '@/src/lib/haptics';
import { useCart, useCartTotal } from '@/src/store/cart';
import { continuous, useUi } from '@/src/theme/ui';
import { formatKobo, formatNaira, koboToNaira, nairaToKobo } from '@/src/utils/money';

type DeliveryMode = 'pickup' | 'delivery';
type PayMode = 'wallet' | 'card';

/**
 * Lovable distance-based rider fee formula:
 * ₦1,000 base + ₦200/km rounded up to nearest ₦50 (free for pickup).
 */
function riderFeeForKm(km: number): number {
  if (km <= 0) return 1000;
  if (km > 50) return 8000;
  return Math.ceil((1000 + km * 200) / 50) * 50;
}

export default function CheckoutScreen() {
  const ui = useUi();
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('pickup');
  const [payMode, setPayMode] = useState<PayMode>('wallet');
  const [address, setAddress] = useState('14 Adeniran Ogunsanya St, Surulere, Lagos');
  const [phone, setPhone] = useState('0803 000 0000');
  const [promo, setPromo] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  const [isGift, setIsGift] = useState(false);
  const [recipientHandle, setRecipientHandle] = useState('');
  const [isAnonymousGift, setIsAnonymousGift] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const total = useCartTotal();
  const clear = useCart((s) => s.clear);
  const lines = useCart((s) => s.lines);
  const { data: wallet } = useWallet();
  const createOrder = useCreateOrder();
  const payFromWallet = usePayFromWallet();
  const topUpWallet = useTopUpWallet();

  const sellers = useMemo(() => {
    const names = Array.from(new Set(lines.map((l) => l.vendor || 'Aktive Studio')));
    return names.map((name, i) => ({
      name,
      km: Number((2.8 + i * 1.9).toFixed(1)),
      pickupAddress: i === 0 ? '12 Montgomery Rd, Yaba, Lagos' : '24 Admiralty Way, Lekki Phase 1',
    }));
  }, [lines]);

  const nearestKm = sellers.length ? Math.min(...sellers.map((s) => s.km)) : 2.8;
  const deliveryFeeNaira = useMemo(() => {
    if (deliveryMode === 'pickup') return 0;
    return sellers.reduce((sum, s) => sum + riderFeeForKm(s.km), 0);
  }, [deliveryMode, sellers]);

  const subtotal = total;
  const platformFee = useMemo(() => computePlatformFee(subtotal), [subtotal]);
  const estimatedTotal = subtotal + deliveryFeeNaira + platformFee;
  const balanceNaira = koboToNaira(wallet?.balance ?? 0);

  const placeOrder = async () => {
    setPayError(null);
    vibeHaptics.heavy();
    const vendorId = lines[0]?.vendorId;
    if (!vendorId) {
      setPayError('Cart items are missing vendor data. Add the product again from the market.');
      return;
    }

    const shipStreet =
      deliveryMode === 'pickup'
        ? `Pickup: ${sellers.map((s) => s.pickupAddress).join('; ')}`
        : address.trim();

    createOrder.mutate(
      {
        vendorId,
        items: lines.map((line) => ({
          productId: line.id,
          qty: line.quantity,
          unit: line.priceKobo ?? nairaToKobo(line.price),
        })),
        shipTo: { street: shipStreet, phone: phone.trim() || '08030000000' },
        promoCode: promo.trim() || undefined,
      },
      {
        onSuccess: (order) => {
          payFromWallet.mutate(
            { amount: order.grandTotal, orderId: order.id, vendor: order.vendor },
            {
              onSuccess: () => {
                vibeHaptics.dopamineBurst();
                setCelebrationOpen(true);
              },
              onError: (error) => {
                setPayError(error instanceof Error ? error.message : 'Wallet payment failed.');
              },
            },
          );
        },
        onError: (error) => {
          setPayError(error instanceof Error ? error.message : 'Order creation failed.');
        },
      },
    );
  };

  const handleCelebrationClose = () => {
    setCelebrationOpen(false);
    clear();
    router.replace('/(home-feed)/(tabs)' as never);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Checkout" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        {/* 1. Lovable Delivery Mode Selector (Pickup vs Rider Delivery) */}
        <Text style={[styles.sectionTitle, { color: ui.label }]}>Delivery</Text>
        <View style={styles.optionStack}>
          {(
            [
              {
                key: 'pickup' as const,
                title: 'Pick up from seller',
                eta: `Nearest is ${nearestKm.toFixed(1)} km away`,
                priceLabel: 'Free',
              },
              {
                key: 'delivery' as const,
                title: 'Rider delivery',
                eta: 'Priced by distance from each seller',
                priceLabel: formatNaira(sellers.reduce((sum, s) => sum + riderFeeForKm(s.km), 0)),
              },
            ] as const
          ).map((o) => {
            const active = deliveryMode === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => {
                  vibeHaptics.selection();
                  setDeliveryMode(o.key);
                }}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: ui.card,
                    borderColor: active ? ui.accent : ui.separator,
                    borderWidth: active ? 2 : 1,
                  },
                ]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.optionTitle, { color: ui.label }]}>{o.title}</Text>
                  <Text style={[styles.optionSub, { color: ui.secondaryLabel }]}>{o.eta}</Text>
                </View>
                <Text style={[styles.optionPrice, { color: ui.label }]}>{o.priceLabel}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* 2. Pickup Spots OR Delivery Address */}
        {deliveryMode === 'pickup' ? (
          <>
            <View style={styles.sectionHeaderInline}>
              <Ionicons name="location-outline" size={16} color={ui.label} />
              <Text style={[styles.sectionTitleInline, { color: ui.label }]}>Pickup spots</Text>
            </View>
            <View style={styles.optionStack}>
              {sellers.map((s) => (
                <View
                  key={s.name}
                  style={[
                    styles.pickupSpotCard,
                    {
                      backgroundColor: ui.card,
                      borderColor: ui.separator,
                    },
                  ]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.optionTitle, { color: ui.label }]}>{s.name}</Text>
                    <Text style={[styles.optionSub, { color: ui.secondaryLabel }]}>
                      {s.pickupAddress}
                    </Text>
                  </View>
                  <View style={[styles.kmPill, { backgroundColor: ui.lime }]}>
                    <Text style={[styles.kmPillText, { color: ui.limeForeground }]}>
                      {s.km.toFixed(1)} km
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionHeaderInline}>
              <Ionicons name="location-outline" size={16} color={ui.label} />
              <Text style={[styles.sectionTitleInline, { color: ui.label }]}>Deliver to</Text>
            </View>
            <View style={styles.form}>
              <TextField
                label="Address"
                placeholder="Street address, area, city"
                value={address}
                onChangeText={setAddress}
              />
              <TextField
                label="Phone number"
                placeholder="0803 000 0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </>
        )}

        {/* 3. Pay With (Aktive Wallet vs Card / Bank) */}
        <Text style={[styles.sectionTitle, { color: ui.label }]}>Pay with</Text>
        <View style={styles.payGrid}>
          {(
            [
              {
                key: 'wallet' as const,
                label: 'Aktive wallet',
                sub: `Balance: ${formatKobo(wallet?.balance ?? 0)}`,
                icon: 'wallet-outline' as const,
              },
              {
                key: 'card' as const,
                label: 'Card / bank',
                sub: 'Held in escrow',
                icon: 'card-outline' as const,
              },
            ] as const
          ).map((p) => {
            const active = payMode === p.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => {
                  vibeHaptics.selection();
                  setPayMode(p.key);
                }}
                style={[
                  styles.payOptionBox,
                  {
                    backgroundColor: ui.card,
                    borderColor: active ? ui.accent : ui.separator,
                    borderWidth: active ? 2 : 1,
                  },
                ]}>
                <Ionicons name={p.icon} size={20} color={ui.accent} />
                <Text style={[styles.payOptionTitle, { color: ui.label }]}>{p.label}</Text>
                <Text style={[styles.payOptionSub, { color: ui.secondaryLabel }]} numberOfLines={1}>
                  {p.sub}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {wallet && balanceNaira < estimatedTotal ? (
          <Pressable
            onPress={() => {
              vibeHaptics.medium();
              topUpWallet.mutate(
                {
                  amount: nairaToKobo(Math.max(50000, estimatedTotal - balanceNaira + 10000)),
                  source: 'Instant Top-Up',
                },
                { onSuccess: () => setPayError(null) },
              );
            }}
            disabled={topUpWallet.isPending}
            style={[styles.topUpBanner, { backgroundColor: ui.lime }]}>
            <Ionicons name="add-circle" size={18} color={ui.limeForeground} />
            <Text style={[styles.topUpBannerText, { color: ui.limeForeground }]}>
              {topUpWallet.isPending
                ? 'Crediting Aktive wallet…'
                : `+ Instant top up ₦50,000 for demo checkout`}
            </Text>
          </Pressable>
        ) : null}

        {/* 4. Optional Gift Toggle */}
        <View style={[styles.giftCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
          <View style={styles.giftHeader}>
            <View style={[styles.giftIconWrap, { backgroundColor: ui.secondary }]}>
              <Ionicons name="gift-outline" size={18} color={ui.coral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: ui.label }]}>Send as a gift</Text>
              <Text style={[styles.optionSub, { color: ui.secondaryLabel }]}>
                Recipient confirms delivery to release escrow
              </Text>
            </View>
            <Switch
              value={isGift}
              onValueChange={(val) => {
                vibeHaptics.selection();
                setIsGift(val);
              }}
              trackColor={{ false: ui.separator, true: ui.accent }}
              thumbColor={ui.isDark ? ui.limeForeground : '#FFFFFF'}
            />
          </View>
          {isGift ? (
            <View style={[styles.giftFields, { borderTopColor: ui.separator }]}>
              <TextField
                placeholder="Recipient's @handle"
                value={recipientHandle}
                onChangeText={setRecipientHandle}
                autoCapitalize="none"
              />
              <View style={styles.anonRow}>
                <Text style={[styles.optionSub, { color: ui.label }]}>Send anonymously</Text>
                <Switch
                  value={isAnonymousGift}
                  onValueChange={setIsAnonymousGift}
                  trackColor={{ false: ui.separator, true: ui.accent }}
                  thumbColor={ui.isDark ? ui.limeForeground : '#FFFFFF'}
                />
              </View>
            </View>
          ) : null}
        </View>

        {payError ? (
          <View style={[styles.payErrorRow, { borderColor: ui.danger }]}>
            <Ionicons name="alert-circle" size={15} color={ui.danger} />
            <Text style={[styles.payErrorText, { color: ui.danger }]}>{payError}</Text>
          </View>
        ) : null}

        {/* 5. Lovable Order Summary Box */}
        <View style={[styles.summaryCard, { backgroundColor: ui.secondary }]}>
          <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
          <SummaryRow
            label="Delivery"
            value={deliveryFeeNaira === 0 ? 'Free' : formatNaira(deliveryFeeNaira)}
          />
          <SummaryRow label={PLATFORM_FEE_LABEL} value={formatNaira(platformFee)} />
          <View style={[styles.divider, { backgroundColor: ui.separator }]} />
          <SummaryRow label="Total" value={formatNaira(estimatedTotal)} emphasized />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: ui.card,
            borderTopColor: ui.separator,
          },
        ]}>
        <PrimaryButton
          label={`Pay ${formatNaira(estimatedTotal)}`}
          loading={createOrder.isPending || payFromWallet.isPending}
          disabled={
            lines.length === 0 || (deliveryMode === 'delivery' && address.trim().length < 5)
          }
          onPress={placeOrder}
        />
      </View>

      <DopamineCelebrationModal
        visible={celebrationOpen}
        onClose={handleCelebrationClose}
        details={{
          title: isGift ? 'Gift Dispatched! 🎁' : 'Order placed! 🎉',
          subtitle: 'The vendor has been told. Your payment is protected in Aktive escrow.',
          isGift,
          recipientHandle: isGift ? recipientHandle || '@friend' : undefined,
          isAnonymous: isAnonymousGift,
          isEscrowPrivate: true,
          amountKobo: estimatedTotal * 100,
        }}
      />
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  const ui = useUi();
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          { color: emphasized ? ui.label : ui.secondaryLabel },
          emphasized && styles.summaryStrong,
        ]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          { color: ui.label },
          emphasized && styles.summaryValueStrong,
        ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
    gap: 14,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    letterSpacing: -0.2,
    marginTop: 6,
  },
  sectionHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sectionTitleInline: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  optionStack: {
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 18,
    gap: 12,
    ...continuous,
  },
  pickupSpotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    ...continuous,
  },
  optionTitle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  optionSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  optionPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
  },
  kmPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  kmPillText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 11,
  },
  form: {
    gap: 10,
  },
  payGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  payOptionBox: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    gap: 4,
    ...continuous,
  },
  payOptionTitle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    marginTop: 4,
  },
  payOptionSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 11,
  },
  topUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    ...continuous,
  },
  topUpBannerText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 13,
  },
  giftCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    ...continuous,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  giftIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftFields: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(229, 38, 47, 0.08)',
  },
  payErrorText: {
    flex: 1,
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 18,
    gap: 8,
    ...continuous,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 14,
  },
  summaryStrong: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 15,
  },
  summaryValue: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  summaryValueStrong: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  bottomBar: {
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
