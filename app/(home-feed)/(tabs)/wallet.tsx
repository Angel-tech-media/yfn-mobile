import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeliveryTrackCard } from '@/components/ui/DeliveryTrackCard';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useWallet } from '@/src/store/wallet';
import { palette, radius, spacing, typography } from '@/src/theme';

const ESCROW_ORDERS = [
  { id: 'ord-1', vendor: 'Aisha Threads', stage: 'In escrow', amount: 18500 },
  { id: 'ord-2', vendor: 'GadgetFix Hub', stage: 'Out for delivery', amount: 9200 },
  { id: 'ord-3', vendor: 'Zara Cakes', stage: 'Confirm receipt', amount: 4500 },
  { id: 'ord-4', vendor: "Sarah's Boutique", stage: 'In escrow', amount: 27000 },
  { id: 'ord-7', vendor: 'Naija Kitchen', stage: 'Preparing', amount: 35000 },
  { id: 'ord-9', vendor: 'Doyin Beauty', stage: 'Scheduled · 24 May', amount: 95000 },
];

const fmt = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

export default function WalletScreen() {
  const balance = useWallet((s) => s.balance);
  const inEscrow = useWallet((s) => s.inEscrow);
  const TX = useWallet((s) => s.recent);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
          <Pressable hitSlop={8} accessibilityLabel="Statements">
            <Ionicons name="document-text-outline" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <LinearGradient
            colors={[palette.brand.orange, palette.brand.orangeDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balanceAmount}>{fmt(balance)}</Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceChip}>
                <Ionicons name="lock-closed" size={12} color="#fff" />
                <Text style={styles.balanceChipText}>{fmt(inEscrow)} in escrow</Text>
              </View>
              <Text style={styles.balanceMeta}>{ESCROW_ORDERS.length} active orders</Text>
            </View>
          </LinearGradient>

          <View style={styles.actionRow}>
            <ActionBtn
              icon="add-circle"
              label="Top up"
              onPress={() => useWallet.getState().topUp(10000, 'Paystack')}
            />
            <ActionBtn
              icon="arrow-up-circle"
              label="Withdraw"
              onPress={() => router.push('/vendor-dashboard/withdraw' as never)}
            />
            <ActionBtn
              icon="repeat"
              label="Referrals"
              onPress={() => router.push('/wallet/referrals' as never)}
            />
            <ActionBtn icon="qr-code" label="Scan" onPress={() => {}} />
          </View>

          <View style={styles.trackingHeader}>
            <Text style={styles.trackingTitle}>Live delivery</Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/orders' as never)}>
              <Text style={styles.sectionLink}>All orders</Text>
            </Pressable>
          </View>
          <DeliveryTrackCard
            vendor="Aisha Threads"
            product="Ankara A-line Dress"
            status="Courier 0.4 km away"
            etaMin={12}
            progress={0.62}
            onTrack={() => router.push('/orders/ord-1/track' as never)}
            onCall={() => {}}
          />

          <Text style={styles.sectionTitle}>In escrow</Text>
          <View style={styles.list}>
            {ESCROW_ORDERS.map((o, i) => (
              <Pressable
                key={o.id}
                onPress={() => router.push(`/orders/${o.id}/track` as never)}
                style={[styles.row, i < ESCROW_ORDERS.length - 1 && styles.rowDivider]}>
                <View style={styles.rowIcon}>
                  <Ionicons name="lock-closed" size={16} color={palette.brand.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{o.vendor}</Text>
                  <Text style={styles.rowMeta}>{o.stage}</Text>
                </View>
                <Text style={styles.rowAmount}>{fmt(o.amount)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recent activity</Text>
          <View style={styles.list}>
            {TX.map((t, i) => (
              <View
                key={t.id}
                style={[styles.row, i < TX.length - 1 && styles.rowDivider]}>
                <View
                  style={[
                    styles.rowIcon,
                    t.kind === 'topup' && styles.iconInfo,
                    t.kind === 'refund' && styles.iconSuccess,
                    t.kind === 'release' && styles.iconSuccess,
                  ]}>
                  <Ionicons
                    name={
                      t.kind === 'escrow_in'
                        ? 'lock-closed'
                        : t.kind === 'release'
                        ? 'checkmark-done'
                        : t.kind === 'topup'
                        ? 'arrow-down'
                        : t.kind === 'referral'
                        ? 'repeat'
                        : 'arrow-undo'
                    }
                    size={16}
                    color={
                      t.kind === 'topup'
                        ? palette.status.info
                        : t.kind === 'refund' || t.kind === 'release'
                        ? palette.status.success
                        : palette.brand.orange
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{t.label}</Text>
                  <Text style={styles.rowMeta}>{t.when}</Text>
                </View>
                <Text
                  style={[
                    styles.rowAmount,
                    t.kind === 'topup' && { color: palette.status.info },
                    (t.kind === 'refund' || t.kind === 'release') && {
                      color: palette.status.success,
                    },
                    t.kind === 'referral' && { color: palette.brand.orange },
                  ]}>
                  {t.kind === 'topup' ||
                  t.kind === 'refund' ||
                  t.kind === 'release' ||
                  t.kind === 'referral'
                    ? '+'
                    : '-'}
                  {fmt(t.amount)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionBtn}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={18} color={palette.brand.orange} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h2, color: palette.ink.onDarkStrong },
  scroll: { paddingBottom: 120 },
  balanceCard: {
    marginHorizontal: spacing['4'],
    padding: spacing['5'],
    borderRadius: radius.xl,
    gap: spacing['2'],
    shadowColor: palette.brand.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    ...typography.display,
    color: '#fff',
    fontSize: 36,
    lineHeight: 42,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['2'],
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  balanceChipText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  balanceMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['5'],
    gap: spacing['2'],
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 149, 68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.caption,
    color: palette.ink.onDarkStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  sectionTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['2'],
    marginTop: spacing['3'],
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    marginTop: spacing['5'],
    marginBottom: spacing['3'],
  },
  trackingTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  sectionLink: {
    ...typography.caption,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  list: {
    marginHorizontal: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['3'],
    gap: spacing['3'],
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line.onDark,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(216, 149, 68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInfo: { backgroundColor: 'rgba(25,118,210,0.15)' },
  iconSuccess: { backgroundColor: 'rgba(76,175,80,0.15)' },
  rowTitle: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  rowMeta: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  rowAmount: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
});
