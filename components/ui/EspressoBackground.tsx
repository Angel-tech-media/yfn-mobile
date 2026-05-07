import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '@/src/theme';

type Props = PropsWithChildren<{
  variant?: 'espresso' | 'welcomePeach';
}>;

export function EspressoBackground({ variant = 'espresso', children }: Props) {
  const colors =
    variant === 'welcomePeach'
      ? ([
          palette.bg.welcomePeachStart,
          palette.bg.welcomePeachMid,
          palette.bg.welcomePeachEnd,
        ] as const)
      : ([
          palette.bg.espressoStart,
          palette.bg.espressoMid,
          palette.bg.espressoEnd,
        ] as const);

  const locations = [0, 0.55, 1] as const;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...colors]}
        locations={[...locations]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {variant === 'espresso' ? (
        <LinearGradient
          colors={['rgba(253,134,22,0.18)', 'rgba(253,134,22,0)']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg.espressoEnd,
  },
});
