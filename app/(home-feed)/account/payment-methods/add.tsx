import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RadioRow } from '@/components/ui/RadioRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useCreatePaymentMethod } from '@/src/api/account/hooks';
import type { CreatePaymentMethodRequest } from '@/src/api/types';
import { palette, spacing, typography } from '@/src/theme';

const METHOD_TYPES: CreatePaymentMethodRequest['type'][] = ['card', 'transfer', 'wallet'];

export default function AddPaymentScreen() {
  const [type, setType] = useState<CreatePaymentMethodRequest['type']>('card');
  const [label, setLabel] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const createPaymentMethod = useCreatePaymentMethod();

  const errors = useMemo(() => {
    const e: { label?: string; authorizationCode?: string } = {};
    if (label && label.trim().length < 2) e.label = 'Label too short';
    if (type === 'card' && authorizationCode && !authorizationCode.startsWith('AUTH_')) {
      e.authorizationCode = 'Use a Paystack AUTH_ code';
    }
    return e;
  }, [authorizationCode, label, type]);

  const canSave =
    label.trim().length >= 2 &&
    (type !== 'card' || authorizationCode.startsWith('AUTH_')) &&
    !createPaymentMethod.isPending;

  const save = () => {
    createPaymentMethod.mutate(
      {
        type,
        label: label.trim(),
        isDefault,
        paystackAuthorizationCode:
          type === 'card' ? authorizationCode.trim() : undefined,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Add payment method" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Method type</Text>
          <View style={styles.typeList}>
            {METHOD_TYPES.map((methodType) => (
              <RadioRow
                key={methodType}
                label={methodTypeLabel(methodType)}
                selected={type === methodType}
                onPress={() => setType(methodType)}
              />
            ))}
          </View>
          <TextField
            label="Label"
            placeholder="Personal Visa, GTBank transfer, Wallet"
            value={label}
            onChangeText={setLabel}
            error={errors.label}
          />
          {type === 'card' ? (
            <TextField
              label="Paystack authorization code"
              placeholder="AUTH_..."
              value={authorizationCode}
              onChangeText={(t) => setAuthorizationCode(t.trim())}
              autoCapitalize="characters"
              error={errors.authorizationCode}
            />
          ) : null}
          <View style={styles.checkboxWrap}>
            <Checkbox checked={isDefault} onChange={setIsDefault} label="Set as default payment method" />
          </View>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton
          label="Save payment method"
          loading={createPaymentMethod.isPending}
          disabled={!canSave}
          onPress={save}
        />
      </View>
    </ScreenContainer>
  );
}

function methodTypeLabel(type: CreatePaymentMethodRequest['type']) {
  if (type === 'card') return 'Tokenized card';
  if (type === 'transfer') return 'Bank transfer';
  return 'Wallet';
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], paddingBottom: 40 },
  form: { gap: spacing['3'] },
  sectionTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  typeList: { gap: spacing['2'] },
  checkboxWrap: { paddingVertical: spacing['1'] },
  actions: { paddingVertical: spacing['3'] },
});
