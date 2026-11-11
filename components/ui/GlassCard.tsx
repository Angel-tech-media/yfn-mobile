import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { radius } from '@/src/theme';
import { glass } from '@/src/theme/plasma';

type Tone = 'dark' | 'light';

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  intensity?: number;
  cornerRadius?: number;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  /** Draw the soft top-edge highlight that makes glass read as glass. Default on. */
  sheen?: boolean;
};

/**
 * Frosted glass panel: real backdrop blur, a translucent tint, a bright hairline rim and a soft
 * top sheen. On Android the blur uses the Dimezis backend; the tint alone still reads as glass
 * because the plasma behind it is already soft.
 */
export function GlassCard({
  children,
  tone = 'dark',
  intensity = 40,
  cornerRadius = radius.lg,
  borderColor,
  sheen = true,
  style,
}: Props) {
  const g = tone === 'dark' ? glass.dark : glass.light;
  const ring = borderColor ?? g.rim;

  return (
    <View style={[styles.root, { borderRadius: cornerRadius, borderColor: ring }, style]}>
      <BlurView
        intensity={intensity}
        tint={g.blurTint}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: g.fill }]} />
      {sheen ? (
        <LinearGradient
          pointerEvents="none"
          colors={g.sheen}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.45 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
  },
  content: {
    position: 'relative',
  },
});
