import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { palette, spacing, typography } from '@/src/theme';

type Props = {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  tone?: 'onDark' | 'onLight';
};

export function TopBar({
  title,
  onBack,
  showBack = true,
  rightAction,
  tone = 'onDark',
}: Props) {
  const tint = tone === 'onDark' ? palette.ink.onDarkStrong : palette.ink.onLightStrong;

  return (
    <View style={styles.root}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={onBack ?? (() => router.back())}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={22} color={tint} />
          </Pressable>
        ) : null}
      </View>
      {title ? (
        <Text style={[styles.title, { color: tint }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View />
      )}
      <View style={styles.sideRight}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    width: 40,
    alignItems: 'flex-start',
  },
  sideRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pressed: { opacity: 0.7 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    paddingHorizontal: spacing['2'],
  },
});
