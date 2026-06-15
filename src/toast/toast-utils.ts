import { Platform } from 'react-native';

import * as Haptics from 'expo-haptics';

import type {
  ToastInput,
  ToastOptions,
  ToastPlacement,
  ToastPromiseInput,
  ToastRecord,
  ToastVariant,
} from '@/src/toast/types';

const DEFAULT_DURATION = 4600;
const ERROR_DURATION = 6200;

export function normalizeToast(input: ToastInput, defaultPlacement: ToastPlacement): ToastRecord {
  const options = ensureToastOptions(input, 'info');
  const variant = options.variant ?? 'info';
  return {
    ...options,
    id: options.id ?? createToastId(),
    title: options.title,
    variant,
    placement: options.placement ?? defaultPlacement,
    duration: options.duration ?? getDefaultDuration(variant),
    dismissible: options.dismissible ?? true,
    createdAt: Date.now(),
  };
}

export function ensureToastOptions(input: ToastInput, fallbackVariant: ToastVariant): ToastOptions {
  if (typeof input === 'string') {
    return { title: input, variant: fallbackVariant };
  }
  return { ...input, variant: input.variant ?? fallbackVariant };
}

export function resolvePromiseToast<T>(
  input: ToastPromiseInput<T>,
  value: T,
  fallbackVariant: ToastVariant
): ToastInput {
  const resolved = typeof input === 'function' ? input(value) : input;
  const options = ensureToastOptions(resolved, fallbackVariant);
  return { ...options, variant: options.variant ?? fallbackVariant };
}

export function playToastHaptic(variant: ToastVariant) {
  if (Platform.OS === 'web' || variant === 'loading') return;

  if (variant === 'success') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }
  if (variant === 'error') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  if (variant === 'warning') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return;
  }
  void Haptics.selectionAsync();
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Please try again.';
}

function getDefaultDuration(variant: ToastVariant) {
  if (variant === 'loading') return false;
  if (variant === 'error') return ERROR_DURATION;
  return DEFAULT_DURATION;
}

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
