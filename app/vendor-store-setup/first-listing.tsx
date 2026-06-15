import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { LinkText } from '@/components/ui/LinkText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useCreateProduct } from '@/src/api/products/hooks';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';
import { nairaToKobo } from '@/src/utils/money';

const MAX_IMAGES = 6;

export default function FirstListingScreen() {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [outOfStock, setOutOfStock] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const createProduct = useCreateProduct();

  const { pick, pickMany } = useImagePicker();

  const fromCamera = async () => {
    const img = await pick('camera');
    if (img) setImages((arr) => [...arr, img].slice(0, MAX_IMAGES));
  };
  const fromGallery = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const picked = await pickMany(remaining);
    if (picked.length) setImages((arr) => [...arr, ...picked].slice(0, MAX_IMAGES));
  };
  const removeAt = (i: number) => setImages((arr) => arr.filter((_, j) => j !== i));
  const numericPrice = Number(salePrice.replace(/[^0-9]/g, '')) || 0;
  const canSave = name.trim().length > 0 && category.trim().length > 0 && numericPrice > 0;

  const save = (continueToLive: boolean) => {
    if (!canSave) return;
    createProduct.mutate(
      {
        title: name.trim(),
        description: desc.trim(),
        price: nairaToKobo(numericPrice),
        category: category.trim(),
        stock: outOfStock ? 0 : 1,
        mediaIds: [],
        active: !outOfStock,
      },
      {
        onSuccess: () => {
          if (continueToLive) {
            router.replace('/vendor-store-setup/live');
            return;
          }
          setName('');
          setDesc('');
          setCategory('');
          setSalePrice('');
          setDiscountPrice('');
          setOutOfStock(false);
          setImages([]);
        },
      },
    );
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title=""
        showBack
        rightAction={<LinkText onPress={() => router.replace('/vendor-store-setup/live')}>Skip</LinkText>}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add your first{'\n'}listing</Text>

        <View style={styles.form}>
          <TextField placeholder="Product name" value={name} onChangeText={setName} />
          <TextField
            placeholder="Description"
            value={desc}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
            style={styles.descInput}
          />
          <TextField placeholder="Category tag" value={category} onChangeText={setCategory} />

          <PriceField label="Sale Price" value={salePrice} onChangeText={setSalePrice} />
          <PriceField label="Discounted Price" value={discountPrice} onChangeText={setDiscountPrice} />

          {images.length === 0 ? (
            <Pressable onPress={() => setSheetOpen(true)} style={({ pressed }) => [styles.uploadCard, pressed && { opacity: 0.85 }]}>
              <View style={styles.uploadBubble}>
                <Ionicons name="image-outline" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.uploadLabel}>
                Upload images <Text style={styles.uploadCount}>· 0/{MAX_IMAGES}</Text>
              </Text>
            </Pressable>
          ) : (
            <View style={{ gap: spacing['2'] }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing['2'] }}>
                {images.map((img, i) => (
                  <View key={img.uri + i} style={styles.thumbCell}>
                    <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    <Pressable onPress={() => removeAt(i)} hitSlop={6} style={styles.thumbDelete}>
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                {images.length < MAX_IMAGES ? (
                  <Pressable onPress={() => setSheetOpen(true)} style={({ pressed }) => [styles.thumbAdd, pressed && { opacity: 0.85 }]}>
                    <Ionicons name="add" size={24} color={palette.ink.onDarkSoft} />
                  </Pressable>
                ) : null}
              </ScrollView>
              <Text style={styles.uploadCountLine}>{images.length}/{MAX_IMAGES}</Text>
            </View>
          )}

          <View style={styles.checkboxWrap}>
            <Checkbox
              checked={outOfStock}
              onChange={setOutOfStock}
              label={
                <Text style={styles.cbLabel}>
                  Mark as <Text style={styles.cbHighlight}>&quot;Out of Stock&quot;</Text>
                </Text>
              }
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label="Add another"
          variant="ghost"
          loading={createProduct.isPending}
          disabled={!canSave || createProduct.isPending}
          onPress={() => save(false)}
        />
        <PrimaryButton
          label="Save and Continue"
          loading={createProduct.isPending}
          disabled={!canSave || createProduct.isPending}
          onPress={() => save(true)}
        />
      </View>

      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={fromCamera}
        onGallery={fromGallery}
        title="Add product images"
      />
    </ScreenContainer>
  );
}

function PriceField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.priceField}>
      <View style={styles.currencyBadge}>
        <Text style={styles.currencyText}>₦</Text>
      </View>
      <Pressable style={styles.priceInputWrap}>
        <TextField
          placeholder={label}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          containerStyle={{ flex: 1 }}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing['8'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
    textAlign: 'center',
    paddingTop: spacing['4'],
    paddingBottom: spacing['6'],
  },
  form: { gap: spacing['3'] },
  descInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing['3'],
  },
  priceField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  currencyBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  currencyText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  priceInputWrap: { flex: 1 },
  uploadCard: {
    height: 140,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  uploadBubble: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(186,104,200,0.6)',
    transform: [{ rotate: '-6deg' }],
  },
  uploadLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  uploadCount: {
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  thumbCell: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbAdd: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCountLine: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  checkboxWrap: { paddingVertical: spacing['1'] },
  cbLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  cbHighlight: {
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  actions: {
    gap: spacing['3'],
    paddingVertical: spacing['4'],
  },
});
