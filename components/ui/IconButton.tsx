import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale, type HapticKind } from '@/components/ui/PressableScale';
import { palette } from '@/src/theme';

type Variant = 'translucent' | 'solid' | 'ghost';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  variant?: Variant;
  color?: string;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  haptic?: HapticKind;
  scaleTo?: number;
  disabled?: boolean;
};

export function IconButton({
  icon,
  onPress,
  size = 44,
  iconSize,
  variant = 'translucent',
  color = palette.ink.onDarkStrong,
  accessibilityLabel,
  style,
  haptic = 'light',
  scaleTo = 0.92,
  disabled = false,
}: Props) {
  const bg =
    variant === 'solid'
      ? palette.bg.surface
      : variant === 'translucent'
      ? 'rgba(0, 0, 0, 0.22)'
      : 'transparent';
  const tint = variant === 'solid' ? palette.ink.onLightStrong : color;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      haptic={haptic}
      scaleTo={scaleTo}
      disabled={disabled}
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
        variant === 'translucent' && styles.translucentBorder,
        style,
      ]}>
      <Ionicons name={icon} size={iconSize ?? Math.round(size * 0.5)} color={tint} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  translucentBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
