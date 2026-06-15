import { StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToastCard } from '@/components/ui/ToastCard';
import { spacing } from '@/src/theme';

import type { ToastRecord } from '@/src/toast/types';

type Props = {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
  onExited: (id: string) => void;
};

export function ToastViewport({ toasts, onDismiss, onExited }: Props) {
  const insets = useSafeAreaInsets();
  const topToasts = toasts.filter((toast) => toast.placement === 'top');
  const bottomToasts = toasts.filter((toast) => toast.placement === 'bottom');

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        pointerEvents="box-none"
        style={[styles.stack, styles.topStack, { paddingTop: Math.max(insets.top, spacing['4']) }]}>
        {topToasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} onExited={onExited} />
        ))}
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.stack,
          styles.bottomStack,
          { paddingBottom: Math.max(insets.bottom, spacing['4']) },
        ]}>
        {bottomToasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} onExited={onExited} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    left: 0,
    paddingHorizontal: spacing['4'],
    position: 'absolute',
    right: 0,
    zIndex: 1000,
  },
  topStack: {
    top: 0,
  },
  bottomStack: {
    bottom: 0,
  },
});
