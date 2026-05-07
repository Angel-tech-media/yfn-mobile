import { StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette } from '@/src/theme';

type Tone = 'brand' | 'success';

type Props = {
  tone?: Tone;
  size?: number;
};

export function VerifiedCheck({ tone = 'brand', size = 16 }: Props) {
  const bg = tone === 'brand' ? palette.brand.orange : palette.status.success;
  return (
    <View
      style={[
        styles.root,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}>
      <Ionicons name="checkmark" size={size * 0.7} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
