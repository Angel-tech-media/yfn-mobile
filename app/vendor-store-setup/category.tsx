import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Cat = {
  key: string;
  label: string;
  emoji: string;
  tint: string;
};

const CATS: Cat[] = [
  { key: 'fashion', label: 'Fashion & Wears', emoji: '👗', tint: 'rgba(76,175,80,0.18)' },
  { key: 'shoes', label: 'Shoes & Footwear', emoji: '👟', tint: 'rgba(186,104,200,0.18)' },
  { key: 'beauty', label: 'Beauty & Skincare', emoji: '💄', tint: 'rgba(76,175,80,0.18)' },
  { key: 'food', label: 'Food & Drinks', emoji: '🍔', tint: 'rgba(76,175,80,0.18)' },
  { key: 'electronics', label: 'Electronics', emoji: '🎧', tint: 'rgba(253,134,22,0.18)' },
  { key: 'art', label: 'Art & Crafts', emoji: '🎨', tint: 'rgba(253,134,22,0.18)' },
  { key: 'home', label: 'Home & Living', emoji: '🛋️', tint: 'rgba(244,67,54,0.18)' },
  { key: 'health', label: 'Health & Wellness', emoji: '💪', tint: 'rgba(33,150,243,0.18)' },
  { key: 'services', label: 'Professional Services', emoji: '💼', tint: 'rgba(244,67,54,0.18)' },
  { key: 'education', label: 'Education & Tutoring', emoji: '📚', tint: 'rgba(33,150,243,0.18)' },
  { key: 'events', label: 'Events & Entertainment', emoji: '🎉', tint: 'rgba(244,67,54,0.18)' },
  { key: 'others', label: 'Others', emoji: '⚪', tint: 'rgba(158,158,158,0.18)' },
];

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
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    padding: spacing['2'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  tilePicked: {
    borderColor: palette.brand.orange,
    backgroundColor: 'rgba(253,134,22,0.08)',
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
