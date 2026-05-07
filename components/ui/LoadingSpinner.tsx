import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { palette } from '@/src/theme';

type Props = {
  size?: 'small' | 'large';
  color?: string;
  fullscreen?: boolean;
};

export function LoadingSpinner({ size = 'small', color = palette.ink.onDarkStrong, fullscreen }: Props) {
  if (fullscreen) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
