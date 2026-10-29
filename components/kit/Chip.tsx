import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/ui/PressableScale';
import { continuous, corner, type, useUi } from '@/src/theme/ui';

type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Filter / category chip. Selected = filled accent with soft glow, otherwise quiet fill. */
export function Chip({ label, selected = false, icon, onPress, style }: ChipProps) {
  const ui = useUi();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.94}
      style={[
        styles.chip,
        { backgroundColor: selected ? ui.accent : ui.fill },
        selected && styles.chipSelectedGlow,
        style,
      ]}>
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? ui.onAccent : ui.secondaryLabel} />
      ) : null}
      <Text style={[type.subhead, styles.chipLabel, { color: selected ? ui.onAccent : ui.label }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

type BadgeProps = {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'neutral' | 'accent' | 'success' | 'overlay' | 'price';
  style?: StyleProp<ViewStyle>;
};

/** Small status badge: verified, distance, "New", or price overlay. */
export function Badge({ label, icon, tone = 'neutral', style }: BadgeProps) {
  const ui = useUi();
  const palette = {
    neutral: { bg: ui.fill, fg: ui.secondaryLabel },
    accent: { bg: 'rgba(47, 107, 255, 0.18)', fg: ui.accent },
    success: { bg: 'rgba(48, 209, 88, 0.18)', fg: ui.success },
    overlay: { bg: 'rgba(10, 14, 31, 0.65)', fg: '#F5F1EA' },
    price: { bg: 'rgba(10, 14, 31, 0.75)', fg: ui.gold },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      {icon ? <Ionicons name={icon} size={11} color={palette.fg} /> : null}
      {label ? <Text style={[type.caption2, { color: palette.fg, fontFamily: tone === 'price' ? 'Inter_700Bold' : undefined }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...continuous,
  },
  chipSelectedGlow: {
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  chipLabel: {
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...continuous,
  },
});
