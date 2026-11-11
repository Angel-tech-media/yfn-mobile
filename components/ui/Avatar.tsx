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
  initialsBackground = '#26221E',
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
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.4) }]}>{initials}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.52} color="rgba(245, 242, 236, 0.62)" />
      )}
    </View>
  );

  if (ring || isLive) {
    const ringPadding = 1.5;
    const outerSize = size + ringPadding * 2 + 3;
    return (
      <View style={[styles.ringWrapper, { width: outerSize, height: outerSize }]}>
        <LinearGradient
          colors={isLive ? ['#E5262F', '#E85D3F'] : ['#E2D3C1', '#C94124']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.ringGradient, { width: outerSize, height: outerSize, borderRadius: outerSize / 2 }]}>
          <View
            style={[
              styles.ringCutout,
              { width: size + 3, height: size + 3, borderRadius: (size + 3) / 2 },
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
    backgroundColor: '#26221E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245, 242, 236, 0.14)',
  },
  initials: {
    fontFamily: typography.h2.fontFamily,
    color: '#F5F2EC',
    letterSpacing: -0.2,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCutout: {
    backgroundColor: '#08080C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
