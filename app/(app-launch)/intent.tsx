import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { Image } from 'expo-image';
import { router } from 'expo-router';

import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { palette, radius, spacing, typography } from '@/src/theme';

type Intent = 'shop' | 'sell';

type Option = {
  key: Intent;
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
};

const OPTIONS: Option[] = [
  {
    key: 'shop',
    icon: require('@/assets/figma/icon-shop.png'),
    title: 'Shop',
    subtitle: 'Browse and buy from vendors near you',
  },
  {
    key: 'sell',
    icon: require('@/assets/figma/icon-sell.png'),
    title: 'Sell',
    subtitle: 'Set up your vendor store and start earning',
  },
];

export default function IntentScreen() {
  const [selected, setSelected] = useState<Intent | null>(null);

  return (
    <ScreenContainer variant="espresso">
      <View style={styles.titleBlock}>
        <Text style={styles.title}>What brought{'\n'}you to Aktive?</Text>
        <Text style={styles.subtitle}>Pick the one that fits you best — you can change this later.</Text>
      </View>

      <View style={styles.grid}>
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelected(opt.key)}
              style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}>
              <GlassCard
                tone="dark"
                cornerRadius={radius.lg}
                borderColor={isSelected ? palette.brand.orange : 'rgba(0, 0, 0, 0.06)'}
                style={[styles.card, isSelected && styles.cardSelected]}>
                <Image source={opt.icon as any} style={styles.iconImage} contentFit="contain" />
                <Text style={styles.cardTitle}>{opt.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>{opt.subtitle}</Text>
              </GlassCard>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Continue"
          disabled={!selected}
          onPress={() =>
            router.push(selected === 'sell' ? '/signup?role=vendor' : '/signup?role=buyer')
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    paddingTop: spacing['8'],
    paddingBottom: spacing['6'],
    alignItems: 'center',
    gap: spacing['2'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 30,
    lineHeight: 36,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['4'],
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    justifyContent: 'space-between',
    paddingTop: spacing['2'],
  },
  cardWrap: {
    width: '48%',
    aspectRatio: 1,
  },
  card: {
    flex: 1,
    padding: spacing['4'],
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderWidth: 1.5,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconImage: {
    width: 56,
    height: 56,
  },
  cardTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 22,
    color: palette.ink.onDarkStrong,
    marginTop: spacing['3'],
  },
  cardSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
    marginTop: spacing['1'],
  },
  actions: {
    paddingVertical: spacing['4'],
  },
});
