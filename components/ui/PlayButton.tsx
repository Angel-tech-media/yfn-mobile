import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette } from '@/src/theme';

type Props = {
  playing: boolean;
  onToggle: () => void;
  size?: number;
};

export function PlayButton({ playing, onToggle, size = 64 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Pause' : 'Play'}
      onPress={onToggle}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}>
      <View
        style={[
          styles.bubble,
          { width: size, height: size, borderRadius: size / 2 },
        ]}>
        <Ionicons
          name={playing ? 'pause' : 'play'}
          size={size * 0.45}
          color={palette.ink.onLightStrong}
          style={!playing ? { marginLeft: 3 } : undefined}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
