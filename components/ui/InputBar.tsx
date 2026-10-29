import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, radius, spacing, typography } from '@/src/theme';

type Props = TextInputProps & {
  onAttach?: () => void;
  onSend?: () => void;
  onEmojiClick?: () => void;
  attachDisabled?: boolean;
  showEmoji?: boolean;
  showSend?: boolean;
};

export function InputBar({
  onAttach,
  onSend,
  onEmojiClick,
  attachDisabled = false,
  showEmoji = true,
  showSend = true,
  placeholder = 'Reply',
  ...rest
}: Props) {
  return (
    <View style={styles.root}>
      {onAttach ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach media"
          disabled={attachDisabled}
          hitSlop={8}
          onPress={onAttach}
          style={({ pressed }) => [
            styles.iconBtn,
            attachDisabled && { opacity: 0.4 },
            pressed && { opacity: 0.7 },
          ]}>
          <Ionicons name="image-outline" size={18} color={palette.ink.onDarkSoft} />
        </Pressable>
      ) : null}
      {showEmoji ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open emoji picker"
          hitSlop={8}
          onPress={onEmojiClick}
          style={({ pressed }) => [styles.lead, pressed && { opacity: 0.7 }]}>
          <Ionicons name="happy-outline" size={20} color={palette.ink.onDarkSoft} />
        </Pressable>
      ) : null}
      <TextInput
        {...rest}
        placeholder={placeholder}
        placeholderTextColor={palette.ink.onDarkMuted}
        style={styles.input}
      />
      {showSend ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          hitSlop={8}
          onPress={onSend}
          style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.7 }]}>
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing['3'],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing['2'],
  },
  lead: {
    opacity: 0.9,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
});
