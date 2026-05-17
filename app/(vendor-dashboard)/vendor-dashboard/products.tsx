import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StockTag } from '@/components/ui/StockTag';
import { TopBar } from '@/components/ui/TopBar';
import { useUserContent } from '@/src/store/user-content';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

type ProductRow = {
  id: string;
  name: string;
  price: string;
  stock: number;
  sales: number;
  image?: any;
};

const SEED: ProductRow[] = [
  { id: 'p1', name: 'Ankara high shoulder fitted gown', price: '₦24,990', stock: 12, sales: 86 },
  { id: 'p2', name: 'Birkin handbag deluxe edition', price: '₦149,000', stock: 0, sales: 24 },
  { id: 'p3', name: 'Leopard heeled sandals', price: '₦38,500', stock: 5, sales: 142 },
  { id: 'p4', name: 'Silk floral kimono dress', price: '₦27,500', stock: 18, sales: 64 },
];

const FILTERS = ['All', 'Active', 'Out of stock', 'Drafts'];

export default function MyProductsScreen() {
  const [filter, setFilter] = useState('All');
  const userProducts = useUserContent((s) => s.products);

  // Live products from the user-content store come first; then the seeded mocks.
  const ALL: ProductRow[] = [
    ...userProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: '₦' + p.price.toLocaleString('en-NG'),
      stock: 1,
      sales: 0,
      image: p.image,
    })),
    ...SEED,
  ];

  const list = ALL.filter((p) => {
    if (filter === 'Active') return p.stock > 0;
    if (filter === 'Out of stock') return p.stock === 0;
    return true;
  });

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="My products"
        showBack
        rightAction={
          <Pressable onPress={() => router.push('/products/add')} hitSlop={8}>
            <Ionicons name="add" size={22} color={palette.brand.orange} />
          </Pressable>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {list.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/products/${p.id}` as never)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <Image source={PRODUCT_IMAGE} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
              <Text style={styles.price}>{p.price}</Text>
              <View style={styles.metaRow}>
                <StockTag inStock={p.stock > 0} label={p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'} />
                <Text style={styles.salesText}>{p.sales} sold</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.ink.onDarkMuted} />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="+ Add product" onPress={() => router.push('/products/add')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsRow: { paddingVertical: spacing['3'], gap: spacing['2'] },
  chip: {
    paddingHorizontal: spacing['4'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipActive: { backgroundColor: palette.bg.surface, borderColor: palette.bg.surface },
  chipText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  chipTextActive: { color: palette.ink.onLightStrong },
  list: { paddingBottom: 40, gap: spacing['3'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  name: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  price: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  salesText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  actions: { paddingVertical: spacing['3'] },
});
