import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { palette, typography } from '@/src/theme';

type Size = number;

type Props = {
  source?: ImageSourcePropType;
  initials?: string;
  initialsBackground?: string;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  source,
  initials,
  initialsBackground = palette.brand.orange,
  size = 48,
  style,
}: Props) {
  const radius = size / 2;
  return (
    <View
      style={[
        styles.root,
        { width: size, height: size, borderRadius: radius },
        initials && !source ? { backgroundColor: initialsBackground } : null,
        style,
      ]}>
      {source ? (
        <Image source={source} style={{ width: size, height: size, borderRadius: radius }} />
      ) : initials ? (
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.42) }]}>{initials}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.55} color={palette.ink.onDarkMuted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: typography.h2.fontFamily,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
