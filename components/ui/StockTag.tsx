import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/src/theme';

type Props = {
  inStock: boolean;
  label?: string;
};

export function StockTag({ inStock, label }: Props) {
  const bg = inStock ? 'rgba(76,175,80,0.16)' : 'rgba(255,61,0,0.16)';
  const fg = inStock ? '#1F8E26' : '#D32F1A';
  const text = label ?? (inStock ? 'In stock' : 'Out of stock');
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{text}</Text>
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
