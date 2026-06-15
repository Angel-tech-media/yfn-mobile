import { useEffect, useRef } from 'react';

import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { palette, radius, spacing, typography } from '@/src/theme';
import { variantMeta } from '@/src/toast/toast-variants';

import type { ToastAction, ToastRecord } from '@/src/toast/types';

type Props = {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
  onExited: (id: string) => void;
};

export function ToastCard({ toast, onDismiss, onExited }: Props) {
  const meta = variantMeta[toast.variant];
  const offset = toast.placement === 'top' ? -18 : 18;
  const translateY = useRef(new Animated.Value(offset)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (toast.exiting) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 170,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: offset,
          duration: 170,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.98,
          duration: 170,
          useNativeDriver: true,
        }),
      ]).start(() => onExited(toast.id));
      return;
    }

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [offset, onExited, opacity, scale, toast.exiting, toast.id, translateY]);

  useEffect(() => {
    if (toast.exiting || toast.duration === false) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.exiting, toast.id]);

  const runAction = (action: ToastAction) => {
    void action.onPress();
    if (action.dismissOnPress !== false) {
      onDismiss(toast.id);
    }
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toastShell,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}>
      <BlurView
        accessibilityLabel={[toast.title, toast.description].filter(Boolean).join('. ')}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        intensity={36}
        tint="light"
        style={styles.toast}>
        <View style={[styles.accent, { backgroundColor: meta.accent }]} />

        <View style={[styles.iconWrap, { backgroundColor: meta.iconBg }]}>
          {toast.variant === 'loading' ? (
            <ActivityIndicator color={meta.accent} size="small" />
          ) : (
            <Ionicons name={toast.icon ?? meta.icon} size={19} color={meta.accent} />
          )}
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={styles.title}>
              {toast.title}
            </Text>
            {toast.dismissible !== false ? (
              <Pressable
                accessibilityLabel="Dismiss notification"
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => onDismiss(toast.id)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Ionicons name="close" size={18} color={palette.ink.onDarkMuted} />
              </Pressable>
            ) : null}
          </View>

          {toast.description ? (
            <Text numberOfLines={3} style={styles.description}>
              {toast.description}
            </Text>
          ) : null}

          {toast.action || toast.secondaryAction ? (
            <View style={styles.actions}>
              {toast.secondaryAction ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => runAction(toast.secondaryAction as ToastAction)}
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.secondaryActionText}>
                    {toast.secondaryAction.label}
                  </Text>
                </Pressable>
              ) : null}

              {toast.action ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => runAction(toast.action as ToastAction)}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    { backgroundColor: meta.accent },
                    pressed && styles.pressed,
                  ]}>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.primaryActionText}>
                    {toast.action.label}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastShell: {
    alignSelf: 'center',
    marginBottom: spacing['3'],
    maxWidth: 560,
    shadowColor: '#141414',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    width: '100%',
    elevation: 10,
  },
  toast: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(20, 20, 20, 0.08)',
    borderRadius: radius.sm + 3,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing['3'],
    minHeight: 76,
    overflow: 'hidden',
    paddingBottom: spacing['3'],
    paddingLeft: spacing['4'],
    paddingRight: spacing['3'],
    paddingTop: spacing['3'],
  },
  accent: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    marginTop: spacing['0_5'],
    width: 34,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing['2'],
  },
  title: {
    color: palette.ink.onLightStrong,
    flex: 1,
    fontFamily: typography.title.fontFamily,
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
  },
  closeButton: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  description: {
    color: palette.ink.onLightSubtle,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing['1'],
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    justifyContent: 'flex-end',
    marginTop: spacing['3'],
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: radius.sm,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 74,
    paddingHorizontal: spacing['3'],
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: typography.bodyEmphasis.fontSize,
    lineHeight: typography.bodyEmphasis.lineHeight,
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: palette.line.divider,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 74,
    paddingHorizontal: spacing['3'],
  },
  secondaryActionText: {
    color: palette.ink.onLightStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: typography.bodyEmphasis.fontSize,
    lineHeight: typography.bodyEmphasis.lineHeight,
  },
  pressed: {
    opacity: 0.72,
  },
});
