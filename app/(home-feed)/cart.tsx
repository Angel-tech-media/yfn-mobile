import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { vibeHaptics } from '@/src/lib/haptics';
import { useCart, useCartTotal } from '@/src/store/cart';
import { continuous, useUi } from '@/src/theme/ui';

export default function CartScreen() {
  const ui = useUi();
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const total = useCartTotal();

  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);
  const uniqueVendors = Array.from(new Set(lines.map((l) => l.vendor || 'Aktive Seller')));

  const handleQtyChange = (id: string, qty: number, color?: string) => {
    vibeHaptics.selection();
    if (qty <= 0) {
      remove(id, color);
    } else {
      setQuantity(id, qty, color);
    }
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Cart"
        subtitle={totalItems > 0 ? `${totalItems} ${totalItems === 1 ? 'item' : 'items'}` : undefined}
        showBack
      />

      {lines.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyBubble, { backgroundColor: ui.secondary }]}>
            <Ionicons name="bag-handle-outline" size={38} color={ui.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: ui.label }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: ui.secondaryLabel }]}>
            Find something you love in the market and it&apos;ll show up here.
          </Text>
          <View style={styles.emptyAction}>
            <PrimaryButton
              label="Go to market"
              onPress={() => router.replace('/(home-feed)/(tabs)/market' as never)}
            />
          </View>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {/* Lovable Pickup / Delivery Banner */}
            <View style={[styles.deliveryBanner, { backgroundColor: ui.secondary }]}>
              <View style={styles.deliveryBannerHeader}>
                <Ionicons name="car-outline" size={16} color={ui.accent} />
                <Text style={[styles.deliveryBannerTitle, { color: ui.label }]}>
                  Pick up free, or get it delivered
                </Text>
              </View>
              <View style={styles.vendorDistanceList}>
                {uniqueVendors.map((vendorName, i) => (
                  <View key={vendorName + i} style={styles.vendorDistanceRow}>
                    <Text style={[styles.vendorDistanceName, { color: ui.secondaryLabel }]}>
                      {vendorName}
                    </Text>
                    <Text style={[styles.vendorDistanceKm, { color: ui.secondaryLabel }]}>
                      {(2.4 + i * 1.7).toFixed(1)} km away
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Cart Items */}
            {lines.map((l) => (
              <Pressable
                key={l.id + (l.color ?? '')}
                onPress={() => router.push(`/product/${l.id}` as never)}
                style={[
                  styles.row,
                  {
                    backgroundColor: ui.card,
                    borderColor: ui.separator,
                  },
                ]}>
                <Image
                  source={l.image as any}
                  style={[styles.thumb, { backgroundColor: ui.cardRaised }]}
                  contentFit="cover"
                />
                <View style={styles.rowBody}>
                  <Text style={[styles.name, { color: ui.label }]} numberOfLines={2}>
                    {l.name}
                  </Text>
                  <Text style={[styles.vendor, { color: ui.secondaryLabel }]}>
                    {l.vendor}
                    {l.color ? ` · ${l.color}` : ' · One option'}
                  </Text>
                  <View style={styles.rowFooter}>
                    <Text style={[styles.price, { color: ui.label }]}>
                      ₦{(l.price * l.quantity).toLocaleString('en-NG')}
                    </Text>
                    <View style={styles.qty}>
                      <Pressable
                        onPress={() => handleQtyChange(l.id, l.quantity - 1, l.color)}
                        hitSlop={8}
                        style={[styles.qtyBtn, { backgroundColor: ui.secondary }]}>
                        <Ionicons
                          name={l.quantity === 1 ? 'trash-outline' : 'remove'}
                          size={15}
                          color={ui.label}
                        />
                      </Pressable>
                      <Text style={[styles.qtyValue, { color: ui.label }]}>{l.quantity}</Text>
                      <Pressable
                        onPress={() => handleQtyChange(l.id, l.quantity + 1, l.color)}
                        hitSlop={8}
                        style={[styles.qtyBtn, { backgroundColor: ui.secondary }]}>
                        <Ionicons name="add" size={15} color={ui.label} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* Sticky Bottom Bar */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: ui.card,
                borderTopColor: ui.separator,
              },
            ]}>
            <View style={styles.subtotalRow}>
              <Text style={[styles.subtotalLabel, { color: ui.secondaryLabel }]}>Subtotal</Text>
              <Text style={[styles.subtotalValue, { color: ui.label }]}>
                ₦{total.toLocaleString('en-NG')}
              </Text>
            </View>
            <PrimaryButton label="Checkout" onPress={() => router.push('/checkout')} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyBubble: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...continuous,
  },
  emptyTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  emptySubtitle: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    width: '100%',
    marginTop: 12,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  deliveryBanner: {
    padding: 14,
    borderRadius: 18,
    gap: 8,
    ...continuous,
  },
  deliveryBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryBannerTitle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  vendorDistanceList: {
    gap: 4,
  },
  vendorDistanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorDistanceName: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 12,
  },
  vendorDistanceKm: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  thumb: {
    width: 80,
    height: 92,
    borderRadius: 14,
    ...continuous,
  },
  rowBody: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 4,
  },
  name: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    lineHeight: 19,
  },
  vendor: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  price: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
    minWidth: 22,
    textAlign: 'center',
  },
  bottomBar: {
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 14,
  },
  subtotalValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
});
