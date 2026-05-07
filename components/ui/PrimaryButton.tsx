import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/theme';

type Variant = 'primary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.ink.onLightStrong : palette.ink.onDarkStrong} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['5'],
  },
  primary: {
    backgroundColor: palette.bg.surface,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: typography.buttonLabel.fontSize,
    lineHeight: typography.buttonLabel.lineHeight,
  },
  labelPrimary: {
    color: palette.ink.onLightStrong,
  },
  labelGhost: {
    color: palette.ink.onDarkStrong,
  },
});
