import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, typography } from '@/src/theme';

type Props = {
  liked: boolean;
  count?: number;
  onToggle: () => void;
  size?: number;
};

export function HeartButton({ liked, count, onToggle, size = 28 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      onPress={onToggle}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={size}
          color={liked ? '#FF3B47' : palette.ink.onDarkStrong}
        />
      </View>
      {typeof count === 'number' ? (
        <Text style={styles.count}>{formatCount(count)}</Text>
      ) : null}
    </Pressable>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: { opacity: 0.75 },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkStrong,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
});
