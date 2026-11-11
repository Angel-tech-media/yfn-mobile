import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { PressableScale } from '@/components/ui/PressableScale';
import { glass } from '@/src/theme/plasma';
import { continuous, corner, useUi } from '@/src/theme/ui';

type Props = PropsWithChildren<{
  onPress?: () => void;
  onLongPress?: () => void;
  /** Soft drop shadow so the panel floats above the plasma. */
  elevated?: boolean;
  padded?: boolean;
  radius?: keyof typeof corner;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}>;

/**
 * The single card surface: frosted glass with a bright hairline rim and a top sheen.
 * Translucent so the plasma field behind it tints the card as it drifts.
 */
export function Card({
  children,
  onPress,
  onLongPress,
  elevated = false,
  padded = false,
  radius = 'lg',
  style,
  accessibilityLabel,
}: Props) {
  const ui = useUi();
  const g = ui.isDark ? glass.dark : glass.light;
  const base: ViewStyle = {
    backgroundColor: ui.card,
    borderRadius: corner[radius],
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ui.separator,
    ...continuous,
    ...(padded ? { padding: 16 } : null),
    ...(elevated
      ? {
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
        }
      : null),
  };

  const sheen = (
    <LinearGradient
      pointerEvents="none"
      colors={g.sheen}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.4 }}
      style={StyleSheet.absoluteFill}
    />
  );

  if (onPress || onLongPress) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        scaleTo={0.98}
        haptic="light"
        style={[base, style]}>
        {sheen}
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={[base, style]}>
      {sheen}
      {children}
    </View>
  );
}
