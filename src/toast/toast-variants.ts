import { palette } from '@/src/theme';

import type { ToastIcon, ToastVariant } from '@/src/toast/types';

type ToastVariantMeta = {
  icon: ToastIcon;
  accent: string;
  iconBg: string;
};

export const variantMeta: Record<ToastVariant, ToastVariantMeta> = {
  success: {
    icon: 'checkmark-circle',
    accent: '#2F8C5E',
    iconBg: 'rgba(47, 140, 94, 0.12)',
  },
  error: {
    icon: 'alert-circle',
    accent: '#B42318',
    iconBg: 'rgba(180, 35, 24, 0.12)',
  },
  info: {
    icon: 'information-circle',
    accent: '#2266D8',
    iconBg: 'rgba(34, 102, 216, 0.12)',
  },
  warning: {
    icon: 'warning',
    accent: '#B7791F',
    iconBg: 'rgba(183, 121, 31, 0.14)',
  },
  message: {
    icon: 'chatbubble-ellipses',
    accent: palette.brand.accentLavender,
    iconBg: 'rgba(168, 155, 212, 0.16)',
  },
  loading: {
    icon: 'sync',
    accent: palette.brand.orangeDeep,
    iconBg: 'rgba(166, 105, 46, 0.13)',
  },
};
