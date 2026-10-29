import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { typography } from '@/src/theme';

type Size = number;

type Props = {
  source?: ImageSourcePropType;
  initials?: string;
  initialsBackground?: string;
  size?: Size;
  ring?: boolean;
  isLive?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  source,
  initials,
  initialsBackground = '#1A2244',
  size = 48,
  ring = false,
  isLive = false,
  style,
}: Props) {
  const radius = size / 2;
  const inner = (
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
        <Ionicons name="person" size={size * 0.55} color="rgba(245, 241, 234, 0.65)" />
      )}
    </View>
  );

  if (ring || isLive) {
    const ringPadding = 2.5;
    const outerSize = size + ringPadding * 2 + 4;
    return (
      <View style={[styles.ringWrapper, { width: outerSize, height: outerSize }]}>
        <LinearGradient
          colors={['#FF3B3B', '#2F6BFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ringGradient, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}>
          <View
            style={[
              styles.ringCutout,
              { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
            ]}>
            {inner}
          </View>
        </LinearGradient>
      </View>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#121833',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: typography.h2.fontFamily,
    color: '#F5F1EA',
    letterSpacing: 0.5,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  ringGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCutout: {
    backgroundColor: '#0A0E1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
