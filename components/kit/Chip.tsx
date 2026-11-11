import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/ui/PressableScale';
import { continuous, type, useUi } from '@/src/theme/ui';

type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Filter / category chip. Selected = warm nude pill with dark espresso label; unselected = smoked stone glass pill. */
export function Chip({ label, selected = false, icon, onPress, style }: ChipProps) {
  const ui = useUi();
  const selBg = ui.isDark ? '#FAFAFA' : '#09090B';
  const selFg = ui.isDark ? '#09090B' : '#FAFAFA';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      haptic="selection"
      scaleTo={0.95}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? selBg : ui.card,
          borderColor: selected ? selBg : ui.separator,
        },
        style,
      ]}>
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? selFg : ui.secondaryLabel} />
      ) : null}
      <Text style={[type.subhead, styles.chipLabel, { color: selected ? selFg : ui.label }]}>
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
    neutral: { bg: ui.card, fg: ui.secondaryLabel, border: ui.separator },
    accent: { bg: 'rgba(232, 93, 63, 0.16)', fg: ui.accent, border: 'rgba(232, 93, 63, 0.32)' },
    success: { bg: 'rgba(48, 209, 88, 0.16)', fg: ui.success, border: 'rgba(48, 209, 88, 0.30)' },
    overlay: { bg: 'rgba(14, 13, 12, 0.72)', fg: '#F5F2EC', border: 'rgba(245, 242, 236, 0.16)' },
    price: { bg: 'rgba(14, 13, 12, 0.80)', fg: ui.gold, border: 'rgba(226, 201, 166, 0.30)' },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      {icon ? <Ionicons name={icon} size={11} color={palette.fg} /> : null}
      {label ? (
        <Text
          style={[
            type.caption2,
            { color: palette.fg, fontFamily: tone === 'price' ? 'InterTight_700Bold' : undefined },
          ]}>
          {label}
        </Text>
      ) : null}
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
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  chipLabel: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
  },
  badge: {
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
});
