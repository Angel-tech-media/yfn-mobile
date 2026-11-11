import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

import { SECTORS } from '@/src/config/sectors';

type Cat = {
  key: string;
  label: string;
  emoji: string;
  tint: string;
};

const CATS: Cat[] = SECTORS.map((s) => ({
  key: s.key,
  label: s.label,
  emoji: s.emoji,
  tint: s.tint,
}));

export default function CategoryScreen() {
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = (k: string) => {
    const next = new Set(picked);
    next.has(k) ? next.delete(k) : next.add(k);
    setPicked(next);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />

      <Text style={styles.title}>Choose your{'\n'}category</Text>

      <View style={styles.grid}>
        {CATS.map((c) => {
          const isPicked = picked.has(c.key);
          return (
            <Pressable
              key={c.key}
              onPress={() => toggle(c.key)}
              style={({ pressed }) => [
                styles.tile,
                isPicked && styles.tilePicked,
                pressed && { opacity: 0.85 },
              ]}>
              <View style={[styles.iconWrap, { backgroundColor: c.tint }]}>
                <Text style={styles.emoji}>{c.emoji}</Text>
              </View>
              <Text style={styles.tileLabel} numberOfLines={2}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Continue"
          disabled={picked.size === 0}
          onPress={() => router.push('/vendor-store-setup/store-details')}
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
    paddingTop: spacing['6'],
    paddingBottom: spacing['6'],
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    justifyContent: 'space-between',
  },
  tile: {
    width: '31%',
    aspectRatio: 0.95,
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing['2'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  tilePicked: {
    borderColor: palette.brand.orange,
    backgroundColor: 'rgba(232, 93, 63,0.08)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  tileLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  actions: {
    paddingVertical: spacing['4'],
  },
});
