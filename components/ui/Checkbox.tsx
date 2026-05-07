import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  tone?: 'onDark' | 'onLight';
};

export function Checkbox({ checked, onChange, label, disabled, tone = 'onDark' }: Props) {
  const labelColor =
    tone === 'onDark' ? palette.ink.onDarkSoft : palette.ink.onLightSubtle;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      onPress={() => !disabled && onChange(!checked)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
      </View>
      {label ? (
        typeof label === 'string' ? (
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        ) : (
          <View style={styles.labelWrap}>{label}</View>
        )
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.xs + 1,
    borderWidth: 1.5,
    borderColor: palette.line.onDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  boxChecked: {
    borderColor: palette.brand.orange,
    backgroundColor: palette.brand.orange,
  },
  label: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  labelWrap: {
    flex: 1,
  },
});
