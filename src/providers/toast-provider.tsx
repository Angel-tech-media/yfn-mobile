import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { ToastViewport } from '@/components/ui/ToastViewport';
import {
  ensureToastOptions,
  getErrorMessage,
  normalizeToast,
  playToastHaptic,
  resolvePromiseToast,
} from '@/src/toast/toast-utils';

import type {
  ToastApi,
  ToastInput,
  ToastPlacement,
  ToastPromiseMessages,
  ToastRecord,
  ToastShortcutOptions,
  ToastVariant,
} from '@/src/toast/types';

export type {
  ToastAction,
  ToastApi,
  ToastInput,
  ToastOptions,
  ToastPlacement,
  ToastPromiseMessages,
  ToastShortcutOptions,
  ToastVariant,
} from '@/src/toast/types';

type ToastProviderProps = PropsWithChildren<{
  maxVisible?: number;
  defaultPlacement?: ToastPlacement;
}>;

const MAX_VISIBLE = 3;

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({
  children,
  maxVisible = MAX_VISIBLE,
  defaultPlacement = 'top',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast))
    );
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((current) => current.map((toast) => ({ ...toast, exiting: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const toast = normalizeToast(input, defaultPlacement);
      setToasts((current) => {
        const withoutSameId = current.filter((item) => item.id !== toast.id);
        return [toast, ...withoutSameId].slice(0, maxVisible);
      });
      if (toast.haptic !== false) {
        playToastHaptic(toast.variant);
      }
      return toast.id;
    },
    [defaultPlacement, maxVisible]
  );

  const showVariant = useCallback(
    (variant: ToastVariant, title: string, options?: ToastShortcutOptions) =>
      show({ ...options, title, variant }),
    [show]
  );

  const promise = useCallback(
    async <T,>(source: Promise<T>, messages: ToastPromiseMessages<T>) => {
      const loadingToast = ensureToastOptions(messages.loading, 'loading');
      const loadingId = show({
        ...loadingToast,
        duration: loadingToast.duration ?? false,
        haptic: loadingToast.haptic ?? false,
      });

      try {
        const result = await source;
        dismiss(loadingId);
        if (messages.success) {
          show(resolvePromiseToast(messages.success, result, 'success'));
        }
        return result;
      } catch (error) {
        dismiss(loadingId);
        if (messages.error) {
          show(resolvePromiseToast(messages.error, error, 'error'));
        } else {
          show({
            title: 'Something went wrong',
            description: getErrorMessage(error),
            variant: 'error',
          });
        }
        throw error;
      }
    },
    [dismiss, show]
  );

  const value = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, options) => showVariant('success', title, options),
      error: (title, options) => showVariant('error', title, options),
      info: (title, options) => showVariant('info', title, options),
      warning: (title, options) => showVariant('warning', title, options),
      message: (title, options) => showVariant('message', title, options),
      dismiss,
      dismissAll,
      promise,
    }),
    [dismiss, dismissAll, promise, show, showVariant]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} onExited={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return context;
}
