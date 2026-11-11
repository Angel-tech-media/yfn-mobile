import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeliveryTrackCard } from '@/components/ui/DeliveryTrackCard';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { useOrders } from '@/src/api/orders/hooks';
import { useTopUpWallet, useWallet } from '@/src/api/wallet/hooks';
import { continuous, layout, type, useUi } from '@/src/theme/ui';
import { formatKobo, nairaToKobo } from '@/src/utils/money';

export default function WalletScreen() {
  const ui = useUi();
  const [hidden, setHidden] = useState(false);
  const { data: wallet, isLoading, isError, refetch, isFetching } = useWallet();
  const { data: orders = [] } = useOrders({ limit: 20 });
  const topUp = useTopUpWallet();
  const activeOrders = orders.filter(
    (order) => !['released', 'refunded'].includes(order.status),
  );
  const firstActive = activeOrders[0];

  const handleTopUp = () => {
    topUp.mutate({ amount: nairaToKobo(10000), source: 'Paystack' });
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: ui.label }]}>Wallet</Text>
          <PressableScale
            haptic="light"
            onPress={() => router.push('/orders' as never)}
            style={[styles.escrowHeaderChip, { backgroundColor: ui.secondary }]}>
            <Ionicons name="shield-checkmark" size={14} color={ui.accent} />
            <Text style={[styles.escrowHeaderText, { color: ui.secondaryForeground }]}>Escrow active</Text>
          </PressableScale>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {isLoading ? (
            <View style={styles.stateBlock}>
              <ActivityIndicator color={ui.accent} />
              <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>Loading wallet…</Text>
            </View>
          ) : isError || !wallet ? (
            <View style={styles.stateBlock}>
              <Ionicons name="cloud-offline-outline" size={32} color={ui.secondaryLabel} />
              <Text style={[styles.stateTitle, { color: ui.label }]}>Couldn&apos;t load wallet</Text>
              <Pressable onPress={() => refetch()} disabled={isFetching}>
                <Text style={[styles.sectionLink, { color: ui.coral }]}>
                  {isFetching ? 'Retrying…' : 'Try again'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Lovable Deep Forest Ink Balance Hero Card */}
              <LinearGradient
                colors={ui.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}>
                <View style={styles.balanceTopRow}>
                  <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                  <Pressable hitSlop={10} onPress={() => setHidden((v) => !v)}>
                    <Ionicons
                      name={hidden ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="rgba(244, 242, 232, 0.72)"
                    />
                  </Pressable>
                </View>

                <Text style={styles.balanceAmount}>
                  {hidden ? '••••••••' : formatKobo(wallet.balance)}
                </Text>

                <View style={styles.escrowSplitRow}>
                  <View style={styles.escrowSplitBox}>
                    <View style={styles.escrowSplitHeader}>
                      <Ionicons name="lock-closed" size={12} color="#C8FF3B" />
                      <Text style={styles.escrowSplitLabel}>IN ESCROW</Text>
                    </View>
                    <Text style={styles.escrowSplitValue}>
                      {hidden ? '••••••' : formatKobo(wallet.inEscrow)}
                    </Text>
                    <Text style={styles.escrowSplitSub}>{activeOrders.length} active orders</Text>
                  </View>
                  <View style={styles.escrowSplitBox}>
                    <View style={styles.escrowSplitHeader}>
                      <Ionicons name="sparkles" size={12} color="#C8FF3B" />
                      <Text style={styles.escrowSplitLabel}>ESCROW SHIELD</Text>
                    </View>
                    <Text style={styles.escrowSplitValue}>100%</Text>
                    <Text style={styles.escrowSplitSub}>Released on delivery</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <ActionBtn
                    icon="add"
                    label={topUp.isPending ? 'Adding…' : 'Top up'}
                    primary
                    onPress={handleTopUp}
                  />
                  <ActionBtn
                    icon="arrow-up"
                    label="Withdraw"
                    onPress={() => router.push('/vendor-dashboard/withdraw' as never)}
                  />
                  <ActionBtn
                    icon="people-outline"
                    label="Referrals"
                    onPress={() => router.push('/wallet/referrals' as never)}
                  />
                  <ActionBtn
                    icon="qr-code-outline"
                    label="Scan"
                    onPress={() => {}}
                  />
                </View>
              </LinearGradient>

              {/* Live Delivery Tracking */}
              <View style={styles.trackingHeader}>
                <Text style={[styles.trackingTitle, { color: ui.label }]}>Live delivery</Text>
                <Pressable hitSlop={8} onPress={() => router.push('/orders' as never)}>
                  <Text style={[styles.sectionLink, { color: ui.coral }]}>All orders</Text>
                </Pressable>
              </View>
              {firstActive ? (
                <DeliveryTrackCard
                  vendor={firstActive.vendor}
                  product={firstActive.items[0]?.name ?? 'Order items'}
                  status={statusLabel(firstActive.status)}
                  etaMin={12}
                  progress={progressFor(firstActive.status)}
                  onTrack={() => router.push(`/orders/${firstActive.id}/track` as never)}
                  onCall={() => {}}
                />
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                  <Ionicons name="cube-outline" size={24} color={ui.secondaryLabel} />
                  <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>No active deliveries</Text>
                </View>
              )}

              {/* Held in Escrow */}
              <Text style={[styles.sectionTitle, { color: ui.label }]}>Held in escrow</Text>
              <View style={[styles.list, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                {activeOrders.length === 0 ? (
                  <View style={styles.emptyCardInner}>
                    <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>
                      No orders currently held in escrow.
                    </Text>
                  </View>
                ) : (
                  activeOrders.map((o, i) => (
                    <Pressable
                      key={o.id}
                      onPress={() => router.push(`/orders/${o.id}/track` as never)}
                      style={[
                        styles.row,
                        i < activeOrders.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: ui.separator,
                        },
                      ]}>
                      <View style={[styles.rowIcon, { backgroundColor: ui.secondary }]}>
                        <Ionicons name="lock-closed" size={16} color={ui.accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rowTitle, { color: ui.label }]}>{o.vendor}</Text>
                        <Text style={[styles.rowMeta, { color: ui.secondaryLabel }]}>
                          {statusLabel(o.status)}
                        </Text>
                      </View>
                      <Text style={[styles.rowAmount, { color: ui.label }]}>{formatKobo(o.grandTotal)}</Text>
                    </Pressable>
                  ))
                )}
              </View>

              {/* Recent Activity */}
              <Text style={[styles.sectionTitle, { color: ui.label }]}>Recent activity</Text>
              <View style={[styles.list, { backgroundColor: ui.card, borderColor: ui.separator }]}>
                {wallet.recent.length === 0 ? (
                  <View style={styles.emptyCardInner}>
                    <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>No wallet activity yet.</Text>
                  </View>
                ) : (
                  wallet.recent.map((t, i) => {
                    const isCredit =
                      t.kind === 'topup' ||
                      t.kind === 'refund' ||
                      t.kind === 'release' ||
                      t.kind === 'referral';
                    return (
                      <View
                        key={t.id}
                        style={[
                          styles.row,
                          i < wallet.recent.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: ui.separator,
                          },
                        ]}>
                        <View
                          style={[
                            styles.rowIcon,
                            {
                              backgroundColor: isCredit
                                ? 'rgba(46, 179, 109, 0.14)'
                                : ui.secondary,
                            },
                          ]}>
                          <Ionicons
                            name={isCredit ? 'arrow-down' : 'arrow-up'}
                            size={16}
                            color={isCredit ? ui.success : ui.label}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.rowTitle, { color: ui.label }]}>{t.label}</Text>
                          <Text style={[styles.rowMeta, { color: ui.secondaryLabel }]}>{formatWhen(t.when)}</Text>
                        </View>
                        <Text
                          style={[
                            styles.rowAmount,
                            { color: isCredit ? ui.success : ui.label },
                          ]}>
                          {isCredit ? '+' : '-'}
                          {formatKobo(t.amount)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Lovable Coral Referral Banner */}
              <PressableScale
                haptic="light"
                scaleTo={0.985}
                onPress={() => router.push('/wallet/referrals' as never)}
                style={[styles.referralBanner, { backgroundColor: ui.coral }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.referralKicker}>REFER & EARN</Text>
                  <Text style={styles.referralTitle}>Invite friends, earn ₦1,000</Text>
                  <Text style={styles.referralSub}>On their first escrow-protected order</Text>
                </View>
                <View style={styles.referralIconCircle}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
              </PressableScale>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function statusLabel(status: string) {
  if (status === 'paid') return 'Paid · held in escrow';
  if (status === 'confirmed') return 'Vendor confirmed';
  if (status === 'packed') return 'Packed';
  if (status === 'shipped') return 'In transit';
  if (status === 'delivered') return 'Confirm receipt';
  if (status === 'disputed') return 'Disputed';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function progressFor(status: string) {
  if (status === 'paid') return 0.18;
  if (status === 'confirmed') return 0.35;
  if (status === 'packed') return 0.5;
  if (status === 'shipped') return 0.72;
  if (status === 'delivered') return 0.9;
  return 0.1;
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ActionBtn({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale haptic="light" scaleTo={0.95} onPress={onPress} style={styles.actionBtn}>
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor: primary ? '#C8FF3B' : 'rgba(255, 255, 255, 0.12)',
          },
        ]}>
        <Ionicons name={icon} size={18} color={primary ? '#162821' : '#F4F2E8'} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: layout.gutter,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 26,
    letterSpacing: -0.6,
  },
  escrowHeaderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  escrowHeaderText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  scroll: { paddingBottom: 120 },
  stateBlock: {
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: 40,
    gap: 8,
  },
  stateTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  stateText: {
    ...type.subhead,
    textAlign: 'center',
  },
  balanceCard: {
    marginHorizontal: layout.gutter,
    padding: 20,
    borderRadius: 26,
    gap: 14,
    ...continuous,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(244, 242, 232, 0.72)',
  },
  balanceAmount: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 34,
    letterSpacing: -1,
    color: '#F4F2E8',
  },
  escrowSplitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  escrowSplitBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 12,
    gap: 2,
  },
  escrowSplitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  escrowSplitLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.6,
    color: 'rgba(244, 242, 232, 0.72)',
  },
  escrowSplitValue: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 17,
    color: '#F4F2E8',
    marginTop: 2,
  },
  escrowSplitSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 10,
    color: 'rgba(244, 242, 232, 0.62)',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
    color: 'rgba(244, 242, 232, 0.9)',
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    marginTop: 22,
    marginBottom: 10,
  },
  trackingTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
    paddingHorizontal: layout.gutter,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionLink: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  emptyCard: {
    marginHorizontal: layout.gutter,
    padding: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 6,
  },
  emptyCardInner: {
    padding: 20,
    alignItems: 'center',
  },
  list: {
    marginHorizontal: layout.gutter,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
  rowMeta: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 14,
  },
  referralBanner: {
    marginHorizontal: layout.gutter,
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...continuous,
  },
  referralKicker: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  referralTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 2,
  },
  referralSub: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  referralIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
