import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/ui/PressableScale';
import { palette, typography } from '@/src/theme';

type Props = {
  liked: boolean;
  count?: number;
  onToggle: () => void;
  size?: number;
};

export function HeartButton({ liked, count, onToggle, size = 28 }: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      onPress={onToggle}
      haptic="selection"
      scaleTo={0.84}
      style={styles.root}>
      <View style={[styles.iconWrap, styles.iconDropShadow]}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={size}
          color={liked ? '#FF3B47' : '#FFFFFF'}
        />
      </View>
      {typeof count === 'number' ? (
        <Text style={styles.count}>{formatCount(count)}</Text>
      ) : null}
    </PressableScale>
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
  iconDropShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
