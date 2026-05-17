import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';
import { z } from 'zod';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useAccount } from '@/src/store/account';
import { spacing } from '@/src/theme';

const addressSchema = z.object({
  recipient: z.string().min(2, 'Recipient name too short'),
  street: z.string().min(4, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  phone: z
    .string()
    .min(7, 'Phone too short')
    .regex(/^[+\d\s-]+$/, 'Only digits, spaces, + and - allowed'),
});

export default function AddAddressScreen() {
  const [label, setLabel] = useState('Home');
  const [recipient, setRecipient] = useState('David Okpo');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const add = useAccount((s) => s.addAddress);

  const validation = useMemo(
    () => addressSchema.safeParse({ recipient, street, city, state, phone }),
    [recipient, street, city, state, phone],
  );

  const errors = useMemo(() => {
    const errs: Partial<Record<'recipient' | 'street' | 'city' | 'state' | 'phone', string>> = {};
    if (validation.success) return errs;
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof typeof errs;
      const value =
        key === 'recipient' ? recipient :
        key === 'street' ? street :
        key === 'city' ? city :
        key === 'state' ? state : phone;
      if (value) errs[key] = issue.message;
    }
    return errs;
  }, [validation, recipient, street, city, state, phone]);

  const save = () => {
    if (!validation.success) return;
    add({ label, recipient, street, city, state, phone, isDefault });
    router.back();
  };

  const canSave = validation.success;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Add address" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <TextField label="Label" placeholder="Home, Work, …" value={label} onChangeText={setLabel} />
          <TextField label="Recipient" placeholder="Full name" value={recipient} onChangeText={setRecipient} error={errors.recipient} />
          <TextField label="Street address" placeholder="Street, building" value={street} onChangeText={setStreet} error={errors.street} />
          <TextField label="City" placeholder="City" value={city} onChangeText={setCity} error={errors.city} />
          <TextField label="State / Region" placeholder="State or region" value={state} onChangeText={setState} error={errors.state} />
          <TextField
            label="Phone"
            placeholder="+234 …"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <View style={styles.checkboxWrap}>
            <Checkbox checked={isDefault} onChange={setIsDefault} label="Set as default address" />
          </View>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton label="Save address" disabled={!canSave} onPress={save} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], paddingBottom: 40 },
  form: { gap: spacing['3'] },
  checkboxWrap: { paddingVertical: spacing['1'] },
  actions: { paddingVertical: spacing['3'] },
});
