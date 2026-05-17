import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

import { palette } from '@/src/theme';

type Props = {
  baseColor?: string;
  stripeColor?: string;
  /** Stripe spacing in dp (centre-to-centre). Default 18. */
  spacing?: number;
  /** Stripe thickness in dp. Default 1.4. */
  stripeWidth?: number;
};

/**
 * Soft diagonal zebra pattern used as a friendly background — meant to be
 * placed in `StyleSheet.absoluteFill` behind content. Strokes are kept light
 * so they read as texture, not noise.
 */
export function ZebraBackground({
  baseColor = palette.bg.cream,
  stripeColor = 'rgba(28, 22, 14, 0.06)',
  spacing = 18,
  stripeWidth = 1.4,
}: Props) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="zebra"
            patternUnits="userSpaceOnUse"
            width={spacing}
            height={spacing}
            patternTransform="rotate(45)">
            <Path
              d={`M0 0 L0 ${spacing}`}
              stroke={stripeColor}
              strokeWidth={stripeWidth}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#zebra)" />
      </Svg>
    </View>
  );
}
