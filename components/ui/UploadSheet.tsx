import { Pressable, StyleSheet, Text } from 'react-native';

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
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>
      <Row icon="camera-outline" label="Take a photo" onPress={() => { onClose(); onCamera(); }} />
      <Row icon="images-outline" label="Choose from gallery" onPress={() => { onClose(); onGallery(); }} />
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.85 }]}>
        <Text style={styles.cancelLabel}>Cancel</Text>
      </Pressable>
    </BottomSheet>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={palette.ink.onDarkStrong} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
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
  },
  label: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: palette.ink.onDarkStrong,
  },
  cancel: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2'],
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  cancelLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
});
