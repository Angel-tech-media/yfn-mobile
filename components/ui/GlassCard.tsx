import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';

import { palette, radius } from '@/src/theme';

type Tone = 'dark' | 'light';

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  intensity?: number;
  cornerRadius?: number;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
};

export function GlassCard({
  children,
  tone = 'dark',
  intensity = 22,
  cornerRadius = radius.lg,
  borderColor,
  style,
}: Props) {
  const fallbackBg =
    tone === 'dark' ? 'rgba(20,12,8,0.55)' : 'rgba(255,255,255,0.10)';
  const ring = borderColor ?? (tone === 'dark' ? 'rgba(255,255,255,0.10)' : palette.line.onDark);

  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.root,
          {
            borderRadius: cornerRadius,
            borderColor: ring,
            backgroundColor: fallbackBg,
          },
          style,
        ]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.root, { borderRadius: cornerRadius, borderColor: ring }, style]}>
      <BlurView
        intensity={intensity}
        tint={tone === 'dark' ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius: cornerRadius }]}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: fallbackBg, borderRadius: cornerRadius }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    position: 'relative',
  },
});
