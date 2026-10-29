import { useCallback, useRef, type ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { vibeHaptics } from '@/src/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticKind = 'none' | 'selection' | 'light' | 'medium' | 'heavy';

export type PressableScaleProps = Omit<PressableProps, 'style' | 'onPress' | 'children'> & {
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  /** Scale while the finger is down. 1 disables the squish. */
  scaleTo?: number;
  /** Tactile feedback fired on a completed tap. */
  haptic?: HapticKind;
  /** Ignore repeat taps inside this window (ms). Use for actions that must not fire twice. */
  debounceMs?: number;
};

/**
 * The one pressable every tappable surface should use. It gives the whole app the same feel:
 * a spring "squish" on touch (UI thread, no re-render), a haptic on confirm, a disabled dim,
 * and optional double-tap protection.
 */
export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  haptic = 'none',
  debounceMs = 0,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const lastPressAt = useRef(0);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(scaleTo, { stiffness: 420, damping: 24, mass: 0.6 });
      onPressIn?.(event);
    },
    [onPressIn, scale, scaleTo],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(1, { stiffness: 320, damping: 18, mass: 0.6 });
      onPressOut?.(event);
    },
    [onPressOut, scale],
  );

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (debounceMs > 0) {
        const now = Date.now();
        if (now - lastPressAt.current < debounceMs) return;
        lastPressAt.current = now;
      }
      if (haptic !== 'none') void vibeHaptics[haptic]();
      onPress?.(event);
    },
    [debounceMs, haptic, onPress],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, disabled && { opacity: 0.5 }, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
