import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  value?: string;
  placeholder: string;
  onPress: () => void;
  leftIcon?: IconName;
  rightIcon?: IconName;
};

export function SelectField({
  value,
  placeholder,
  onPress,
  leftIcon,
  rightIcon = 'chevron-down',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={placeholder}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && { opacity: 0.85 }]}>
      {leftIcon ? (
        <Ionicons name={leftIcon} size={18} color={palette.ink.onDarkSoft} style={styles.leftIcon} />
      ) : null}
      <Text style={[styles.label, !value && styles.placeholder]} numberOfLines={1}>
        {value ?? placeholder}
      </Text>
      <Ionicons name={rightIcon} size={18} color={palette.ink.onDarkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  leftIcon: {
    marginRight: spacing['3'],
  },
  label: {
    flex: 1,
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onDarkStrong,
  },
  placeholder: {
    color: palette.ink.onDarkMuted,
  },
});
