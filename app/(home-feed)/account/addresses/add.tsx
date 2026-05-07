import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { useAccount } from '@/src/store/account';
import { spacing } from '@/src/theme';

export default function AddAddressScreen() {
  const [label, setLabel] = useState('Home');
  const [recipient, setRecipient] = useState('David Okpo');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const add = useAccount((s) => s.addAddress);

  const save = () => {
    add({ label, recipient, street, city, state, phone, isDefault });
    router.back();
  };

  const canSave = recipient && street && city && state && phone;

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Add address" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <TextField label="Label" placeholder="Home, Work, …" value={label} onChangeText={setLabel} />
          <TextField label="Recipient" placeholder="Full name" value={recipient} onChangeText={setRecipient} />
          <TextField label="Street address" placeholder="Street, building" value={street} onChangeText={setStreet} />
          <TextField label="City" placeholder="City" value={city} onChangeText={setCity} />
          <TextField label="State / Region" placeholder="State or region" value={state} onChangeText={setState} />
          <TextField
            label="Phone"
            placeholder="+234 …"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
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
