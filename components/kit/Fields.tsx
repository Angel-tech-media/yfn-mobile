import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/ui/PressableScale';
import { continuous, corner, type, useUi } from '@/src/theme/ui';

type Props = {
  placeholder: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

/**
 * Tappable glass search / ask field with a hairline luminous rim.
 */
export function SearchField({ placeholder, onPress, icon = 'search' }: Props) {
  const ui = useUi();
  return (
    <PressableScale
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      onPress={onPress}
      haptic="light"
      scaleTo={0.985}
      style={[
        styles.field,
        {
          backgroundColor: ui.card,
          borderColor: ui.separator,
        },
      ]}>
      <Ionicons name={icon} size={18} color={ui.secondaryLabel} />
      <Text style={[type.body, styles.text, { color: ui.secondaryLabel }]} numberOfLines={1}>
        {placeholder}
      </Text>
    </PressableScale>
  );
}

/** Formats a price consistently: gold #F4C464, tight neo-grotesk bold amount. */
export function PriceTag({ value, size = 'md' }: { value: string; size?: 'sm' | 'md' | 'lg' }) {
  const ui = useUi();
  const style = size === 'lg' ? type.title2 : size === 'sm' ? type.subhead : type.headline;
  return <Text style={[style, { color: ui.gold, fontFamily: 'InterTight_700Bold' }]}>{value}</Text>;
}

/** Icon-only circular glass button with a hairline rim; the standard nav-bar action. */
export function NavIconButton({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  const ui = useUi();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic="light"
      scaleTo={0.9}
      hitSlop={6}
      style={[
        styles.navBtn,
        {
          backgroundColor: ui.card,
          borderColor: ui.separator,
        },
      ]}>
      <Ionicons name={icon} size={20} color={ui.label} />
      {badge && badge > 0 ? (
        <View style={[styles.dot, { backgroundColor: ui.accent }]}>
          <Text style={[type.caption2, { color: ui.onAccent }]}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 44,
    borderRadius: corner.pill,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  text: { flex: 1 },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
