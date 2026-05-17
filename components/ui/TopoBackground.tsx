import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  color?: string;
  strokeWidth?: number;
};

/**
 * Topographic contour-line background. Renders as an absolute-fill overlay,
 * so place it inside a relatively-positioned container.
 */
export function TopoBackground({
  color = 'rgba(0, 0, 0, 0.06)',
  strokeWidth = 1.2,
}: Props) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 400 220"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}>
      <Path
        d="M-40 30 Q 60 8 160 38 T 360 28 T 560 50"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M-40 58 Q 60 36 160 66 T 360 56 T 560 78"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M-40 90 Q 60 70 160 96 T 360 88 T 560 108"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M-40 122 Q 60 100 160 128 T 360 120 T 560 140"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M-40 152 Q 60 132 160 160 T 360 150 T 560 172"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M-40 184 Q 60 162 160 192 T 360 182 T 560 202"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Cross contours for ridge-feel */}
      <Path
        d="M40 -20 Q 60 60 50 140 T 70 280"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        fill="none"
        opacity={0.6}
      />
      <Path
        d="M260 -20 Q 280 60 270 140 T 290 280"
        stroke={color}
        strokeWidth={strokeWidth * 0.7}
        fill="none"
        opacity={0.6}
      />
    </Svg>
  );
}
