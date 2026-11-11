import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useEffectiveMode } from '@/src/store/theme';
import { plasma } from '@/src/theme/plasma';

import { PlasmaBackground } from './PlasmaBackground';

type Props = PropsWithChildren<{
  /** Kept for backwards compatibility; every variant now sits on the shared plasma field. */
  variant?: 'espresso' | 'welcomePeach';
}>;

/**
 * App-wide screen background.
 *
 * Renders the animated <PlasmaBackground> directly inside the screen container so native
 * Android ScreenStacks never occlude the plasma orbs or fall back to a white window background.
 */
export function EspressoBackground({ children }: Props) {
  const mode = useEffectiveMode();
  const baseBg = mode === 'dark' ? plasma.baseDark : plasma.baseLight;
  return (
    <View style={[styles.root, { backgroundColor: baseBg }]}>
      <PlasmaBackground />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
