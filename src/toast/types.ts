import { Ionicons } from '@expo/vector-icons';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'message' | 'loading';
export type ToastPlacement = 'top' | 'bottom';
export type ToastIcon = keyof typeof Ionicons.glyphMap;

export type ToastAction = {
  label: string;
  onPress: () => void | Promise<void>;
  dismissOnPress?: boolean;
};

export type ToastOptions = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  placement?: ToastPlacement;
  duration?: number | false;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  dismissible?: boolean;
  haptic?: boolean;
  icon?: ToastIcon;
};

export type ToastInput = string | ToastOptions;
export type ToastShortcutOptions = Omit<ToastOptions, 'id' | 'title' | 'variant'> & {
  id?: string;
};

export type ToastRecord = Required<Pick<ToastOptions, 'id' | 'title' | 'variant' | 'placement'>> &
  Omit<ToastOptions, 'id' | 'title' | 'variant' | 'placement'> & {
    createdAt: number;
    exiting?: boolean;
  };

export type ToastPromiseInput<T> = ToastInput | ((value: T) => ToastInput);

export type ToastPromiseMessages<T> = {
  loading: ToastInput;
  success?: ToastPromiseInput<T>;
  error?: ToastPromiseInput<unknown>;
};

export type ToastApi = {
  show(input: ToastInput): string;
  success(title: string, options?: ToastShortcutOptions): string;
  error(title: string, options?: ToastShortcutOptions): string;
  info(title: string, options?: ToastShortcutOptions): string;
  warning(title: string, options?: ToastShortcutOptions): string;
  message(title: string, options?: ToastShortcutOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
  promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T>;
};
