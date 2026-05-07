import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { palette, spacing } from '@/src/theme';

import { EspressoBackground } from './EspressoBackground';

type Props = {
  children: React.ReactNode;
  variant?: 'espresso' | 'welcomePeach' | 'light';
  edges?: Edge[];
  paddingHorizontal?: keyof typeof spacing | 0;
  style?: StyleProp<ViewStyle>;
};

export function ScreenContainer({
  children,
  variant = 'espresso',
  edges = ['top', 'bottom'],
  paddingHorizontal = '5',
  style,
}: Props) {
  const px =
    paddingHorizontal === 0
      ? 0
      : (spacing[paddingHorizontal as keyof typeof spacing] as number);

  if (variant === 'light') {
    return (
      <View style={[styles.lightRoot, style]}>
        <SafeAreaView style={[styles.safe, { paddingHorizontal: px }]} edges={edges}>
          {children}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <EspressoBackground variant={variant}>
      <SafeAreaView style={[styles.safe, { paddingHorizontal: px }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  lightRoot: {
    flex: 1,
    backgroundColor: palette.bg.surface,
  },
});
