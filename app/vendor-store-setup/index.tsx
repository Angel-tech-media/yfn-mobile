import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type OfferType = 'physical' | 'digital' | 'services';

const OPTIONS: Array<{ key: OfferType; label: string }> = [
  { key: 'physical', label: 'Physical Goods' },
  { key: 'digital', label: 'Digital Products' },
  { key: 'services', label: 'Services (or any combination)' },
];

export default function OfferTypeScreen() {
  const [picked, setPicked] = useState<Set<OfferType>>(new Set());

  const toggle = (k: OfferType) => {
    const next = new Set(picked);
    next.has(k) ? next.delete(k) : next.add(k);
    setPicked(next);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <Text style={styles.title}>What do you sell{'\n'}or offer?</Text>

      <View style={styles.list}>
        {OPTIONS.map((o) => (
          <View key={o.key} style={styles.row}>
            <Checkbox
              checked={picked.has(o.key)}
              onChange={() => toggle(o.key)}
              label={o.label}
            />
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <PrimaryButton
          label="Continue"
          disabled={picked.size === 0}
          onPress={() => router.push('/vendor-store-setup/category')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
    paddingTop: spacing['8'],
    paddingBottom: spacing['8'],
  },
  list: {
    gap: spacing['3'],
  },
  row: {
    height: 56,
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
  },
  spacer: { flex: 1 },
  actions: { paddingVertical: spacing['4'] },
});
