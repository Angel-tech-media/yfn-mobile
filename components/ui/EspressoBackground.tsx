import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useUi } from '@/src/theme/ui';

type Props = PropsWithChildren<{
  /** Kept for backwards compatibility; every variant now uses the same calm system background. */
  variant?: 'espresso' | 'welcomePeach';
}>;

/**
 * App-wide screen background.
 *
 * Apple-style: one quiet, flat system background (true black in dark, grouped grey in light).
 * No decorative gradients or glows; hierarchy comes from layered card surfaces instead.
 */
export function EspressoBackground({ children }: Props) {
  const ui = useUi();
  return <View style={[styles.root, { backgroundColor: ui.background }]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
