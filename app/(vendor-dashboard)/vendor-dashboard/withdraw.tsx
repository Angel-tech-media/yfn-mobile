import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RadioRow } from '@/components/ui/RadioRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { usePaymentMethods } from '@/src/api/account/hooks';
import { useWallet, useWithdrawWallet } from '@/src/api/wallet/hooks';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo, formatNaira, koboToNaira, nairaToKobo } from '@/src/utils/money';

export default function WithdrawScreen() {
  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const withdraw = useWithdrawWallet();
  const availableKobo = wallet?.balance ?? 0;
  const availableNaira = koboToNaira(availableKobo);
  const QUICK = [10000, 25000, 100000, availableNaira].filter((value, index, arr) =>
    value > 0 && arr.indexOf(value) === index,
  );
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState<string | null>(methods.find((m) => m.isDefault)?.id ?? methods[0]?.id ?? null);

  useEffect(() => {
    if (!methodId && methods.length > 0) {
      setMethodId(methods.find((m) => m.isDefault)?.id ?? methods[0].id);
    }
  }, [methodId, methods]);

  const numeric = useMemo(() => Number(amount.replace(/[^0-9]/g, '')) || 0, [amount]);
  const overLimit = numeric > availableNaira;
  const canSubmit = numeric > 0 && !overLimit && !!methodId;

  const submit = () => {
    if (!methodId) return;
    withdraw.mutate(
      { amount: nairaToKobo(numeric), bankAccountId: methodId },
      { onSuccess: () => router.replace('/vendor-dashboard/withdraw-confirmed') },
    );
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Withdraw" showBack />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          {walletLoading ? (
            <ActivityIndicator color={palette.brand.orange} />
          ) : (
            <Text style={styles.balanceValue}>{formatKobo(availableKobo)}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Amount</Text>
        <View style={styles.amountField}>
          <Text style={styles.currency}>₦</Text>
          <TextField
            placeholder="0"
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            containerStyle={{ flex: 1 }}
          />
        </View>
        {overLimit ? (
          <Text style={styles.errorText}>Amount exceeds available balance</Text>
        ) : null}

        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable
              key={q}
              onPress={() => setAmount(String(q))}
              style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.85 }]}>
              <Text style={styles.quickChipText}>
                {q === availableNaira ? 'Max' : `₦${(q / 1000).toFixed(0)}K`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Send to</Text>
        <View style={styles.list}>
          {methodsLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={palette.brand.orange} />
              <Text style={styles.emptyText}>Loading payment methods…</Text>
            </View>
          ) : methods.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="card-outline" size={28} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyText}>No payment methods saved</Text>
              <Pressable onPress={() => router.push('/account/payment-methods/add')}>
                <Text style={styles.emptyLink}>Add one</Text>
              </Pressable>
            </View>
          ) : (
            methods.map((m) => (
              <RadioRow
                key={m.id}
                label={`${m.label}${m.last4 ? ` ···· ${m.last4}` : ''}`}
                selected={methodId === m.id}
                onPress={() => setMethodId(m.id)}
              />
            ))
          )}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Withdrawal fee</Text>
            <Text style={styles.summaryValue}>{formatNaira(150)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Arrives in</Text>
            <Text style={styles.summaryValue}>1–2 business days</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label={canSubmit ? `Withdraw ₦${numeric.toLocaleString()}` : 'Withdraw'}
          loading={withdraw.isPending}
          disabled={!canSubmit}
          onPress={submit}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], gap: spacing['3'], paddingBottom: 40 },
  balanceCard: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.30)',
    gap: 4,
  },
  balanceLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  balanceValue: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    color: palette.ink.onDarkStrong,
  },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
    marginTop: spacing['2'],
  },
  amountField: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  currency: {
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: palette.ink.onDarkStrong,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: radius.sm,
    overflow: 'hidden',
    lineHeight: 40,
  },
  errorText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.status.danger,
  },
  quickRow: { flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  quickChipText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
  },
  list: { gap: spacing['2'] },
  empty: { alignItems: 'center', paddingVertical: spacing['6'], gap: 6 },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  emptyLink: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  summary: {
    padding: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    gap: spacing['1'],
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  summaryValue: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  actions: { paddingVertical: spacing['3'] },
});
