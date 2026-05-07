import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function RadioRow({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.dot, selected && styles.dotSelected]}>
        {selected ? <View style={styles.inner} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: spacing['3'],
  },
  rowSelected: {
    borderColor: palette.brand.orange,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.line.onDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    borderColor: palette.brand.orange,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.brand.orange,
  },
  label: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onDarkStrong,
  },
});
