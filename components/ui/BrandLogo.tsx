import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

import { palette, typography } from '@/src/theme';

type Props = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: StyleProp<TextStyle>;
  /** Set false to drop the mascot mark and render the wordmark alone. */
  showMark?: boolean;
};

const sizeMap = {
  sm: { fontSize: 18, lineHeight: 22, letterSpacing: 1.5, mark: 26 },
  md: { fontSize: 24, lineHeight: 28, letterSpacing: 2, mark: 34 },
  lg: { fontSize: 36, lineHeight: 40, letterSpacing: 2.5, mark: 48 },
  xl: { fontSize: 56, lineHeight: 60, letterSpacing: 3, mark: 76 },
} as const;

export function BrandLogo({
  size = 'md',
  color,
  style,
}: Props) {
  const s = sizeMap[size];
  const dotSize = Math.max(6, Math.round(s.fontSize * 0.28));

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.text,
          {
            fontSize: s.fontSize,
            lineHeight: s.lineHeight,
            letterSpacing: -0.8,
            color: color || '#162821',
            fontFamily: 'InterTight_800ExtraBold',
            textTransform: 'lowercase',
          },
          style,
        ]}>
        aktive
      </Text>
      <View
        style={[
          styles.limeDot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: '#C8FF3B',
            marginLeft: 3,
            marginBottom: Math.round(s.fontSize * 0.14),
          },
        ]}
      />
    </View>
  );
}

/**
 * Friendly Shopping Cart Mascot ("Aktive Carty")
 * A warm, lovable shopping companion character with joyful expressive eyes,
 * blushing cheeks, a cheerful smile, shiny wheels, and a golden magic discovery star!
 */
export function CartMascot({
  size = 44,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          {/* Cart Body Warm Sunset Gradient */}
          <LinearGradient id="cartBodyGrad" x1="0.1" y1="0" x2="0.9" y2="1">
            <Stop offset="0" stopColor="#FFB84D" />
            <Stop offset="0.55" stopColor="#FF9F0A" />
            <Stop offset="1" stopColor="#E58600" />
          </LinearGradient>

          {/* Cart Top Rim Highlight */}
          <LinearGradient id="cartRimGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFE6A4" />
            <Stop offset="0.5" stopColor="#FFAB35" />
            <Stop offset="1" stopColor="#E87618" />
          </LinearGradient>

          {/* Magic Shopping Star Gradient */}
          <LinearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFAD4" />
            <Stop offset="0.5" stopColor="#FFD43F" />
            <Stop offset="1" stopColor="#FF9C08" />
          </LinearGradient>

          {/* Wheel Hub Gradient */}
          <LinearGradient id="wheelRimGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE08A" />
            <Stop offset="1" stopColor="#E08B2A" />
          </LinearGradient>
        </Defs>

        {/* 1. Handle Bar with smooth rounded grip */}
        <Path
          d="M 12 28 C 12 21, 18 18, 24 20 L 32 26"
          fill="none"
          stroke="#D89544"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <Path
          d="M 23 27 L 31 43"
          fill="none"
          stroke="#A86220"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 2. Magic Shopping Sparkle popping from basket */}
        {/* Main 4-point magic star */}
        <Path
          d="M 74 8 Q 75 16 82 17 Q 75 18 74 26 Q 73 18 66 17 Q 73 16 74 8 Z"
          fill="url(#starGrad)"
        />
        {/* Micro twinkle sparkles */}
        <Circle cx="85" cy="8" r="2" fill="#FFF275" />
        <Circle cx="59" cy="17" r="1.6" fill="#FFE866" />

        {/* 3. Cart Basket Body */}
        {/* Soft shadow for depth */}
        <Path
          d="M 29 31 C 29 27, 33 25, 37 25 L 75 25 C 81 25, 85 29, 83 35 L 75 64 C 73 70, 68 74, 62 74 L 39 74 C 33 74, 29 69, 28 63 Z"
          fill="#7F3504"
          opacity="0.32"
        />
        {/* Main Cart Basket Shell */}
        <Path
          d="M 28 29 C 28 25, 32 23, 36 23 L 74 23 C 80 23, 84 27, 82 33 L 74 62 C 72 68, 67 72, 61 72 L 38 72 C 32 72, 28 67, 27 61 Z"
          fill="url(#cartBodyGrad)"
        />

        {/* Cart Top Rim */}
        <Path
          d="M 27 24 C 27 22, 29 21, 32 21 L 76 21 C 80 21, 82 23, 81 26 C 80 28, 77 29, 74 29 L 31 29 C 28 29, 27 27, 27 24 Z"
          fill="url(#cartRimGrad)"
        />

        {/* Basket Soft Rib Groove */}
        <Path
          d="M 31 38 L 77 38"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* 4. Cute Friendly Mascot Face on the Basket */}
        {/* Left Eye: Big, glossy, friendly kawaii eye */}
        <Ellipse cx="44" cy="46" rx="4.2" ry="6" fill="#1C1008" />
        <Circle cx="42.5" cy="43.5" r="1.8" fill="#FFFFFF" />
        <Circle cx="45.5" cy="48" r="0.9" fill="#FFFFFF" />

        {/* Right Eye: Big, glossy, friendly kawaii eye */}
        <Ellipse cx="62" cy="46" rx="4.2" ry="6" fill="#1C1008" />
        <Circle cx="60.5" cy="43.5" r="1.8" fill="#FFFFFF" />
        <Circle cx="63.5" cy="48" r="0.9" fill="#FFFFFF" />

        {/* Cute Rosy Blushing Cheeks */}
        <Ellipse cx="37" cy="53" rx="4.2" ry="2.3" fill="#FF5E5E" opacity="0.65" />
        <Ellipse cx="69" cy="53" rx="4.2" ry="2.3" fill="#FF5E5E" opacity="0.65" />

        {/* Joyful Smile with Open Mouth and Sweet Pink Tongue */}
        <Path
          d="M 48 51 C 48 51, 49 59, 53 59 C 57 59, 58 51, 58 51 Z"
          fill="#8B1E10"
        />
        {/* Tongue */}
        <Path
          d="M 49.5 55.5 C 51 54, 55 54, 56.5 55.5 C 55.5 58.5, 50.5 58.5, 49.5 55.5 Z"
          fill="#FF8A8A"
        />
        {/* Smile Top Lip curve */}
        <Path
          d="M 47 51 Q 53 54 59 51"
          fill="none"
          stroke="#1C1008"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* 5. Under-Chassis & Wheel Supports */}
        <Path
          d="M 33 74 L 66 74"
          stroke="#7A3B0E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Path
          d="M 36 74 L 35 83 M 63 74 L 64 83"
          stroke="#5A2808"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 6. Cute Rolling Cart Wheels */}
        {/* Left Wheel */}
        <Circle cx="35" cy="85" r="7.5" fill="#24170E" />
        <Circle cx="35" cy="85" r="4.8" fill="url(#wheelRimGrad)" />
        <Circle cx="35" cy="85" r="2.2" fill="#803D0D" />
        <Circle cx="34.2" cy="84.2" r="0.9" fill="#FFF5D6" />

        {/* Right Wheel */}
        <Circle cx="64" cy="85" r="7.5" fill="#24170E" />
        <Circle cx="64" cy="85" r="4.8" fill="url(#wheelRimGrad)" />
        <Circle cx="64" cy="85" r="2.2" fill="#803D0D" />
        <Circle cx="63.2" cy="84.2" r="0.9" fill="#FFF5D6" />
      </Svg>
    </View>
  );
}

/** Backwards-compatibility alias so existing screens importing HiveMark seamlessly show the new mascot. */
export const HiveMark = CartMascot;

/** Backwards-compatibility badge. */
export const HexBadge = CartMascot;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontFamily: typography.display.fontFamily,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  limeDot: {},
});
