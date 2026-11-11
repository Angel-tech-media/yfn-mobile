import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale, type HapticKind } from '@/components/ui/PressableScale';
import { apiErrorMessage } from '@/src/utils/api-error-message';
import { useToast } from '@/src/hooks/use-toast';
import { radius, spacing } from '@/src/theme';
import { useUi } from '@/src/theme/ui';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void | Promise<unknown>;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<Size, number> = { sm: 38, md: 46, lg: 52 };

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
  const ui = useUi();
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

  const colors = (() => {
    switch (variant) {
      case 'primary':
        return {
          bg: ui.accent,
          fg: ui.onAccent,
          border: ui.accent,
        };
      case 'danger':
        return {
          bg: ui.danger,
          fg: '#FFFFFF',
          border: ui.danger,
        };
      case 'secondary':
        return {
          bg: ui.card,
          fg: ui.label,
          border: ui.separator,
        };
      case 'ghost':
      default:
        return {
          bg: ui.secondary,
          fg: ui.label,
          border: ui.separator,
        };
    }
  })();

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
        isPrimary && styles.primaryShadow,
        { height: HEIGHT[size], backgroundColor: colors.bg, borderColor: colors.border },
        styles.bordered,
        disabled && styles.disabledDim,
        isLoading && !disabled && styles.loadingDim,
        style,
      ]}>
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
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['5'],
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  primaryShadow: {
    shadowColor: '#162821',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  bordered: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  disabledDim: {
    opacity: 0.45,
  },
  loadingDim: {
    opacity: 0.85,
  },
  label: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  labelSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
});
