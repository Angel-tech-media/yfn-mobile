import { StyleSheet, View } from 'react-native';

import { palette } from '@/src/theme';

type Props = {
  total: number;
  current: number;
};

export function Stepper({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx <= current;
        return (
          <View
            key={idx}
            style={[
              styles.bar,
              isActive ? styles.barActive : styles.barIdle,
              idx === current && styles.barCurrent,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bar: {
    width: 28,
    height: 4,
    borderRadius: 2,
  },
  barActive: {
    backgroundColor: palette.ink.onDarkStrong,
  },
  barIdle: {
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  barCurrent: {
    width: 36,
  },
});
