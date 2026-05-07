import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/src/theme';

export type StatusKey = 'completed' | 'cancelled' | 'shipped' | 'pending' | 'confirmed';

const TONE: Record<StatusKey, { bg: string; fg: string; label: string }> = {
  completed: { bg: 'rgba(76,175,80,0.16)', fg: '#1F8E26', label: 'Completed' },
  cancelled: { bg: 'rgba(255,61,0,0.16)', fg: '#D32F1A', label: 'Cancelled' },
  shipped: { bg: 'rgba(124,77,255,0.16)', fg: '#6534D8', label: 'Shipped' },
  pending: { bg: 'rgba(253,134,22,0.16)', fg: '#C76A0E', label: 'Pending' },
  confirmed: { bg: 'rgba(25,118,210,0.16)', fg: '#1463B6', label: 'Confirmed' },
};

type Props = {
  status: StatusKey;
  label?: string;
};

export function StatusBadge({ status, label }: Props) {
  const tone = TONE[status];
  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{label ?? tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
});
