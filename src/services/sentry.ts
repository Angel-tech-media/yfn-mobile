import type React from 'react';
import * as Sentry from '@sentry/react-native';

let isInitialized = false;

/**
 * Initializes Sentry for mobile app crash reporting and performance monitoring.
 * Safe no-op if EXPO_PUBLIC_SENTRY_DSN is unset or empty.
 */
export function initMobileSentry(): boolean {
  const dsn = (process.env.EXPO_PUBLIC_SENTRY_DSN || '').trim();
  if (!dsn) {
    isInitialized = false;
    return false;
  }

  Sentry.init({
    dsn,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableAutoSessionTracking: true,
  });
  isInitialized = true;
  return true;
}

export function captureMobileException(error: unknown, context?: Record<string, unknown>) {
  if (!isInitialized) return;
  Sentry.captureException(error, { extra: context });
}

export function captureMobileMessage(message: string) {
  if (!isInitialized) return;
  Sentry.captureMessage(message);
}

export function isMobileSentryEnabled(): boolean {
  return isInitialized;
}

export function wrapWithSentry<P extends object>(Component: React.ComponentType<P>): React.ComponentType<P> {
  return Sentry.wrap(Component as any) as unknown as React.ComponentType<P>;
}

export { Sentry };
