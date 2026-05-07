import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useAccount } from '@/src/store/account';
import { spacing } from '@/src/theme';

export default function AddPaymentScreen() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const errors = useMemo(() => {
    const e: { number?: string; exp?: string; cvc?: string } = {};
    if (number && number.replace(/\s/g, '').length < 13) e.number = 'Enter a valid card number';
    if (exp && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) e.exp = 'MM/YY';
    if (cvc && !/^\d{3,4}$/.test(cvc)) e.cvc = '3–4 digits';
    return e;
  }, [number, exp, cvc]);

  const canSave =
    name &&
    number.replace(/\s/g, '').length >= 13 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp) &&
    /^\d{3,4}$/.test(cvc);

  const formatCard = (raw: string) =>
    raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

  const formatExp = (raw: string) => {
    const d = raw.replace(/\D/g, '').slice(0, 4);
    if (d.length <= 2) return d;
    return d.slice(0, 2) + '/' + d.slice(2);
  };

  const add = useAccount((s) => s.addPayment);

  const save = () => {
    const last4 = number.replace(/\s/g, '').slice(-4);
    const brand = number.startsWith('4') ? 'visa' : number.startsWith('5') ? 'mastercard' : 'verve';
    add({ type: 'card', brand, last4, label: `${name} · ${brand[0].toUpperCase() + brand.slice(1)}`, isDefault });
    router.back();
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Add card" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <TextField label="Cardholder name" placeholder="As shown on card" value={name} onChangeText={setName} autoCapitalize="words" />
          <TextField
            label="Card number"
            placeholder="1234 1234 1234 1234"
            value={number}
            onChangeText={(t) => setNumber(formatCard(t))}
            keyboardType="number-pad"
            error={errors.number}
          />
          <View style={styles.expRow}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Expiry"
                placeholder="MM/YY"
                value={exp}
                onChangeText={(t) => setExp(formatExp(t))}
                keyboardType="number-pad"
                error={errors.exp}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="CVC"
                placeholder="123"
                value={cvc}
                onChangeText={(t) => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                error={errors.cvc}
                isPassword
              />
            </View>
          </View>
          <View style={styles.checkboxWrap}>
            <Checkbox checked={isDefault} onChange={setIsDefault} label="Set as default payment method" />
          </View>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton label="Save card" disabled={!canSave} onPress={save} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], paddingBottom: 40 },
  form: { gap: spacing['3'] },
  expRow: { flexDirection: 'row', gap: spacing['3'] },
  checkboxWrap: { paddingVertical: spacing['1'] },
  actions: { paddingVertical: spacing['3'] },
});
