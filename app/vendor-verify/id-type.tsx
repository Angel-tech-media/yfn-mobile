import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { RadioRow } from '@/components/ui/RadioRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectField } from '@/components/ui/SelectField';
import { Stepper } from '@/components/ui/Stepper';
import { TopBar } from '@/components/ui/TopBar';
import { palette, spacing, typography } from '@/src/theme';

type IdType = 'national' | 'passport' | 'driver' | 'voter';

const ID_OPTIONS: Array<{ key: IdType; label: string }> = [
  { key: 'national', label: 'National ID card' },
  { key: 'passport', label: 'Passport' },
  { key: 'driver', label: "Driver's license" },
  { key: 'voter', label: "Voter's card" },
];

export default function IdTypeScreen() {
  const [country] = useState('🇳🇬  Nigeria');
  const [idType, setIdType] = useState<IdType | null>(null);

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />
      <Stepper total={4} current={0} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Upload a{'\n'}government ID</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose country</Text>
          <SelectField value={country} placeholder="Country" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select ID type</Text>
          <View style={styles.list}>
            {ID_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.key}
                label={opt.label}
                selected={idType === opt.key}
                onPress={() => setIdType(opt.key)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label="Take Photo"
          disabled={!idType}
          onPress={() => router.push('/vendor-verify/scan-id')}
        />
        <PrimaryButton label="Choose from Gallery" variant="ghost" onPress={() => {}} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing['8'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
    paddingTop: spacing['4'],
    paddingBottom: spacing['6'],
  },
  section: {
    gap: spacing['2'],
    paddingBottom: spacing['5'],
  },
  sectionLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  list: {
    gap: spacing['2'],
  },
  actions: {
    gap: spacing['3'],
    paddingVertical: spacing['4'],
  },
});
