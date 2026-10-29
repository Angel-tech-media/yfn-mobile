import { useCallback, useRef } from 'react';

import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';

import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  title?: string;
};

export function UploadSheet({ visible, onClose, onCamera, onGallery, title = 'Add image' }: Props) {
  const pendingActionRef = useRef<(() => void) | null>(null);

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const closeThenRun = useCallback(
    (action: () => void) => {
      pendingActionRef.current = action;
      onClose();

      if (Platform.OS !== 'ios') {
        setTimeout(runPendingAction, 0);
      }
    },
    [onClose, runPendingAction],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismiss={runPendingAction}>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => closeThenRun(onCamera)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
        <Ionicons name="camera-outline" size={20} color={palette.ink.onDarkStrong} />
        <Text style={styles.label}>Take a photo</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => closeThenRun(onGallery)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
        <Ionicons name="images-outline" size={20} color={palette.ink.onDarkStrong} />
        <Text style={styles.label}>Choose from gallery</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.85 }]}>
        <Text style={styles.cancelLabel}>Cancel</Text>
      </Pressable>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    height: 56,
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing['2'],
  },
  label: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onDarkStrong,
  },
  cancel: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2'],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cancelLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
