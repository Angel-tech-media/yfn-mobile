import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/theme';

export type DayStripItem = {
  /** ISO date or any stable key — used for selection comparison. */
  key: string;
  /** 3-letter weekday header (Mon, Tue…). */
  weekday: string;
  /** Day number (1-31). */
  day: number | string;
  /** Optional badge (e.g. "Today", "ETA", "Now"). */
  badge?: string;
  disabled?: boolean;
};

type Props = {
  items: DayStripItem[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
};

/**
 * Horizontal weekday strip inspired by the Tennis World mockup. The selected
 * day reads as a chartreuse pill with a deep-navy day number — used for
 * delivery windows, event schedules, vendor opening days, etc.
 */
export function DayStrip({ items, selectedKey, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {items.map((item) => {
        const on = item.key === selectedKey;
        return (
          <Pressable
            key={item.key}
            disabled={item.disabled}
            onPress={() => onSelect?.(item.key)}
            style={[styles.cell, on && styles.cellOn, item.disabled && styles.cellOff]}>
            <Text style={[styles.weekday, on && styles.weekdayOn]}>{item.weekday}</Text>
            <View style={[styles.dayBubble, on && styles.dayBubbleOn]}>
              <Text style={[styles.day, on && styles.dayOn]}>{item.day}</Text>
            </View>
            {item.badge ? (
              <View style={[styles.badge, on && styles.badgeOn]}>
                <Text style={[styles.badgeText, on && styles.badgeTextOn]}>{item.badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    gap: spacing['2'],
  },
  cell: {
    width: 56,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  cellOn: {
    backgroundColor: palette.brand.accentLime,
    borderColor: palette.brand.accentLime,
  },
  cellOff: { opacity: 0.4 },
  weekday: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  weekdayOn: { color: palette.bg.espressoEnd },
  dayBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubbleOn: { backgroundColor: palette.bg.espressoEnd },
  day: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  dayOn: { color: palette.brand.accentLime },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  badgeOn: { backgroundColor: 'rgba(0, 0, 0, 0.20)' },
  badgeText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 9,
    color: palette.ink.onDarkSoft,
    letterSpacing: 0.4,
  },
  badgeTextOn: { color: palette.bg.espressoEnd },
});
