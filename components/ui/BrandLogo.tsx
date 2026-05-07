import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { palette, typography } from '@/src/theme';

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: StyleProp<TextStyle>;
};

const sizeMap = {
  sm: { fontSize: 18, lineHeight: 22, letterSpacing: 1.5 },
  md: { fontSize: 24, lineHeight: 28, letterSpacing: 2 },
  lg: { fontSize: 36, lineHeight: 40, letterSpacing: 2.5 },
  xl: { fontSize: 56, lineHeight: 60, letterSpacing: 3 },
} as const;

export function BrandLogo({ size = 'md', color = palette.ink.onDarkStrong, style }: Props) {
  const s = sizeMap[size];
  return (
    <Text
      style={[
        styles.text,
        { fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color },
        style,
      ]}>
      VIBE
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.display.fontFamily,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
