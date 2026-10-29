import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
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
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Go back"
            haptic="light"
            scaleTo={0.9}
            hitSlop={8}
            onPress={onBack ?? (() => router.back())}
            style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={tint} />
          </PressableScale>
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
    width: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    paddingHorizontal: spacing['2'],
  },
});
