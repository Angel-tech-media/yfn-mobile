import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, type, useUi } from '@/src/theme/ui';

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
};

/** Section title with an optional trailing action. Same rhythm everywhere. */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  const ui = useUi();
  return (
    <View style={styles.sectionRow}>
      <Text style={[type.title2, { color: ui.label }]}>{title}</Text>
      {action}
    </View>
  );
}

type LargeTitleHeaderProps = {
  title: string;
  /** Leading brand element, e.g. the mascot. */
  leading?: ReactNode;
  /** Up to two trailing icon buttons. Apple keeps nav bars sparse. */
  trailing?: ReactNode;
};

/**
 * iOS-style large title header with a translucent blur material.
 * Sits in normal flow (not absolute) so content below never hides behind it.
 */
export function LargeTitleHeader({ title, leading, trailing }: LargeTitleHeaderProps) {
  const ui = useUi();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          {leading}
          <Text style={[type.largeTitle, { color: ui.label }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.trailing}>{trailing}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.gutter,
    paddingTop: 8,
    paddingBottom: 8,
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
