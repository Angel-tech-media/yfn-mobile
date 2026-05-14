import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '@/src/theme';

type Props = PropsWithChildren<{
  variant?: 'espresso' | 'welcomePeach';
}>;

/**
 * App-wide background wrapper. Despite the legacy name, the visual is now a
 * clean warm-white surface with a faint honey accent glow at the top.
 */
export function EspressoBackground({ variant = 'espresso', children }: Props) {
  if (variant === 'welcomePeach') {
    return (
      <View style={[styles.root, { backgroundColor: palette.bg.welcomePeachEnd }]}>
        <LinearGradient
          colors={[
            palette.bg.welcomePeachStart,
            palette.bg.welcomePeachMid,
            palette.bg.welcomePeachEnd,
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: '#F7F3EA' }]}>
      <LinearGradient
        colors={['#FAF6EC', '#F4EFE3', '#EDE7D8']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft honey accent glow at the top */}
      <LinearGradient
        colors={['rgba(216, 149, 68, 0.10)', 'rgba(216, 149, 68, 0)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
