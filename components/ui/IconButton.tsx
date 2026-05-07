import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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
}: Props) {
  const bg =
    variant === 'solid'
      ? palette.bg.surface
      : variant === 'translucent'
      ? 'rgba(255,255,255,0.12)'
      : 'transparent';
  const tint = variant === 'solid' ? palette.ink.onLightStrong : color;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        pressed && styles.pressed,
        style,
      ]}>
      <Ionicons name={icon} size={iconSize ?? Math.round(size * 0.5)} color={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
