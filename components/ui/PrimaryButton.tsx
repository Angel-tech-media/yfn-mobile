import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale, type HapticKind } from '@/components/ui/PressableScale';
import { apiErrorMessage } from '@/src/utils/api-error-message';
import { useToast } from '@/src/hooks/use-toast';
import { radius, spacing, typography } from '@/src/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  /**
   * May return a promise. While it is pending the button shows a spinner, ignores further taps
   * and (if it throws) surfaces an error toast — no per-screen loading state needed.
   */
  onPress?: () => void | Promise<unknown>;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Label shown while a promise-returning onPress is pending. */
  loadingLabel?: string;
  /** Force the loading state from the outside (e.g. a react-query mutation). */
  loading?: boolean;
  disabled?: boolean;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<Size, number> = { sm: 38, md: 46, lg: 56 };

function colorsFor(variant: Variant) {
  switch (variant) {
    case 'primary':
      return { bg: 'transparent', fg: '#FFFFFF', border: 'transparent' };
    case 'danger':
      return { bg: '#E5262F', fg: '#FFFFFF', border: 'transparent' };
    case 'secondary':
      return { bg: '#121833', fg: '#F5F1EA', border: 'rgba(47, 107, 255, 0.28)' };
    case 'ghost':
    default:
      return { bg: 'transparent', fg: '#F5F1EA', border: 'rgba(47, 107, 255, 0.20)' };
  }
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loadingLabel,
  loading,
  disabled,
  haptic = 'light',
  style,
}: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handlePress = useCallback(async () => {
    if (inFlight.current || !onPress) return;

    let result: void | Promise<unknown>;
    try {
      result = onPress();
    } catch (error) {
      toast.error('Something went wrong', { description: apiErrorMessage(error) });
      return;
    }

    if (!result || typeof (result as Promise<unknown>).then !== 'function') return;

    inFlight.current = true;
    setBusy(true);
    try {
      await result;
    } catch (error) {
      toast.error('Something went wrong', { description: apiErrorMessage(error) });
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }, [onPress, toast]);

  const isLoading = Boolean(loading) || busy;
  const isPrimary = variant === 'primary';
  const colors = colorsFor(variant);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) || isLoading, busy: isLoading }}
      onPress={handlePress}
      disabled={disabled || isLoading}
      haptic={haptic}
      debounceMs={350}
      style={[
        styles.base,
        isPrimary && styles.primaryGlow,
        { height: HEIGHT[size], backgroundColor: colors.bg, borderColor: colors.border },
        colors.border !== 'transparent' && styles.bordered,
        isLoading && !disabled && styles.loadingDim,
        style,
      ]}>
      {isPrimary ? (
        <LinearGradient
          colors={['#FF3B3B', '#2F6BFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.contentRow} pointerEvents="none">
        {isLoading ? (
          <ActivityIndicator color={colors.fg} />
        ) : icon ? (
          <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={colors.fg} />
        ) : null}
        <Text
          numberOfLines={1}
          style={[styles.label, size === 'sm' && styles.labelSmall, { color: colors.fg }]}>
          {isLoading && loadingLabel ? loadingLabel : label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['5'],
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  primaryGlow: {
    shadowColor: '#2F6BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  bordered: {
    borderWidth: 1,
  },
  loadingDim: {
    opacity: 0.85,
  },
  label: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: typography.buttonLabel.fontSize,
    lineHeight: typography.buttonLabel.lineHeight,
  },
  labelSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
});
