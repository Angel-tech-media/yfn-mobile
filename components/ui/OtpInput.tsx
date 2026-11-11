import { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius, spacing, typography } from '@/src/theme';

type Props = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OtpInput({ length = 6, value, onChange, autoFocus, style }: Props) {
  const refs = useRef<Array<any>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const handleChangeAt = (idx: number, raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '').slice(0, length - idx);
    if (!cleaned) {
      const next = value.slice(0, idx);
      onChange(next);
      if (idx > 0) refs.current[idx - 1]?.focus();
      return;
    }
    const next = (value.slice(0, idx) + cleaned).slice(0, length);
    onChange(next);
    const land = Math.min(idx + cleaned.length, length - 1);
    refs.current[land]?.focus();
  };

  const handleKeyPress = (idx: number, key: string) => {
    if (key === 'Backspace' && !value[idx] && idx > 0) {
      const trimmed = value.slice(0, idx - 1);
      onChange(trimmed);
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length }).map((_, idx) => {
        const ch = value[idx] ?? '';
        const filled = !!ch;
        return (
          <TextInput
            key={idx}
            ref={(r) => { refs.current[idx] = r; }}
            value={ch}
            onChangeText={(t) => handleChangeAt(idx, t)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(idx, nativeEvent.key)}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={length}
            selectTextOnFocus
            style={[styles.cell, filled && styles.cellFilled]}
            cursorColor={palette.brand.orange}
            selectionColor={palette.brand.orange}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing['2'],
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(22, 22, 27, 0.76)',
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    lineHeight: 26,
    padding: 0,
  },
  cellFilled: {
    borderColor: palette.brand.orange,
  },
});
