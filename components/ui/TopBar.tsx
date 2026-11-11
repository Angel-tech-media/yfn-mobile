import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
import { spacing } from '@/src/theme';
import { useUi } from '@/src/theme/ui';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  tone?: 'onDark' | 'onLight';
};

export function TopBar({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction,
}: Props) {
  const ui = useUi();

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
            style={[
              styles.backBtn,
              {
                backgroundColor: ui.card,
                borderColor: ui.separator,
              },
            ]}>
            <Ionicons name="chevron-back" size={20} color={ui.label} />
          </PressableScale>
        ) : null}
      </View>
      {title ? (
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: ui.label }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: ui.secondaryLabel }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <View style={styles.sideRight}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  side: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing['2'],
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 11,
    lineHeight: 14,
  },
});
