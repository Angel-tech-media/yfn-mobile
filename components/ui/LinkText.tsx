import { Pressable, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { palette, typography } from '@/src/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function LinkText({ children, onPress, color = palette.brand.orange, style }: Props) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={6}>
      {({ pressed }) => (
        <Text style={[styles.text, { color, opacity: pressed ? 0.7 : 1 }, style]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
});
