import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Stepper } from '@/components/ui/Stepper';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

const TILES: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; ok: boolean }> = [
  { icon: 'happy-outline', label: 'Bright & visible', ok: true },
  { icon: 'glasses-outline', label: 'No eye cover', ok: false },
  { icon: 'medkit-outline', label: 'No face mask', ok: false },
  { icon: 'eye-off-outline', label: 'No partial face', ok: false },
  { icon: 'moon-outline', label: 'No dark places', ok: false },
];

export default function PhotoGuideScreen() {
  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />
      <Stepper total={4} current={2} />

      <Text style={styles.title}>Upload a profile{'\n'}picture</Text>

      <View style={styles.grid}>
        {TILES.map((t) => (
          <View key={t.label} style={styles.tile}>
            <View style={[styles.badge, t.ok ? styles.badgeOk : styles.badgeBad]}>
              <Ionicons name={t.ok ? 'checkmark' : 'close'} size={12} color="#FFFFFF" />
            </View>
            <View style={styles.tileImage}>
              <Ionicons name={t.icon} size={36} color={palette.ink.onDarkSoft} />
            </View>
            <Text style={styles.tileLabel} numberOfLines={2}>{t.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <PrimaryButton label="Take Photo" onPress={() => router.push('/vendor-verify/snap-selfie')} />
        <PrimaryButton label="Choose from Gallery" variant="ghost" onPress={() => {}} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
    paddingTop: spacing['4'],
    paddingBottom: spacing['6'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    justifyContent: 'space-between',
  },
  tile: {
    width: '31%',
    aspectRatio: 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    padding: spacing['2'],
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  badgeOk: { backgroundColor: '#22C55E' },
  badgeBad: { backgroundColor: '#EF4444' },
  tileImage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  spacer: { flex: 1 },
  actions: {
    gap: spacing['3'],
    paddingVertical: spacing['4'],
  },
});
