import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { palette, radius, spacing, typography } from '@/src/theme';

import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  title?: string;
};

export function DatePickerSheet({
  visible,
  onClose,
  onConfirm,
  initialDate,
  maximumDate,
  minimumDate,
  title = 'Select date',
}: Props) {
  const [date, setDate] = useState<Date>(initialDate ?? new Date(2002, 0, 1));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.pickerWrap}>
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_, d) => d && setDate(d)}
          themeVariant="dark"
          textColor={palette.ink.onDarkStrong}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.btn, styles.cancel, pressed && { opacity: 0.85 }]}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onConfirm(date);
            onClose();
          }}
          style={({ pressed }) => [styles.btn, styles.confirm, pressed && { opacity: 0.85 }]}>
          <Text style={styles.confirmLabel}>Confirm</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['3'],
  },
  pickerWrap: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginTop: spacing['3'],
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  cancelLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  confirm: {
    backgroundColor: palette.bg.surface,
  },
  confirmLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: palette.ink.onLightStrong,
  },
});
