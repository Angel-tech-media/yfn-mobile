import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { continuous, corner, useUi } from '@/src/theme/ui';

type Props = PropsWithChildren<{
  onPress?: () => void;
  onLongPress?: () => void;
  /** Soft subtle night-glow elevation. */
  elevated?: boolean;
  padded?: boolean;
  radius?: keyof typeof corner;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}>;

/** The single card surface. Squircle corners, Night Surface tone (#121833), subtle ambient glow. */
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
  const base: ViewStyle = {
    backgroundColor: ui.card,
    borderRadius: corner[radius],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ui.separator,
    ...continuous,
    ...(padded ? { padding: 16 } : null),
    ...(elevated
      ? {
          shadowColor: '#2F6BFF',
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }
      : null),
  };

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
        {children}
      </PressableScale>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
