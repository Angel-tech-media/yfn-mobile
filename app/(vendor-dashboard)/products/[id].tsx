import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';

const MAX_IMAGES = 6;
const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('Ankara high shoulder fitted gown');
  const [desc, setDesc] = useState('Premium African wax fabric with high-shoulder silhouette and a fitted waist.');
  const [salePrice, setSalePrice] = useState('24990');
  const [discountPrice, setDiscountPrice] = useState('26250');
  const [outOfStock, setOutOfStock] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Edit product"
        showBack
        rightAction={
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <Ionicons name="trash-outline" size={20} color={palette.status.danger} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.idChip}>
          <Text style={styles.idText}>SKU · {String(id).toUpperCase()}</Text>
        </View>

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
          <SelectField placeholder="Select or add category tag" value="Fashion · Wears" onPress={() => {}} />

          <PriceField label="Sale Price" value={salePrice} onChangeText={setSalePrice} />
          <PriceField label="Discounted Price" value={discountPrice} onChangeText={setDiscountPrice} />

          <View style={styles.uploadCard}>
            <Pressable onPress={() => setSheetOpen(true)} style={styles.uploadCenter}>
              <View style={styles.uploadBubble}>
                <Ionicons name="image-outline" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.uploadLabel}>
                Upload more images <Text style={styles.uploadCount}>· {images.length}/{MAX_IMAGES}</Text>
              </Text>
            </Pressable>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
              <Image source={PRODUCT_IMAGE} style={styles.thumbCell} contentFit="cover" />
              {images.map((img, i) => (
                <View key={img.uri + i} style={styles.thumbCell}>
                  <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  <Pressable onPress={() => removeAt(i)} hitSlop={6} style={styles.thumbDelete}>
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
              {images.length + 1 < MAX_IMAGES ? (
                <Pressable onPress={() => setSheetOpen(true)} style={styles.thumbAdd}>
                  <Ionicons name="add" size={24} color={palette.ink.onDarkSoft} />
                </Pressable>
              ) : null}
            </ScrollView>
          </View>

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
        <PrimaryButton label="Save changes" onPress={() => router.replace('/products/saved')} />
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

function PriceField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={styles.priceField}>
      <View style={styles.currencyBadge}>
        <Text style={styles.currencyText}>₦</Text>
      </View>
      <View style={{ flex: 1 }}>
        <TextField placeholder={label} value={value} onChangeText={onChangeText} keyboardType="numeric" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing['8'] },
  idChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: spacing['3'],
    marginBottom: spacing['3'],
  },
  idText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  form: { gap: spacing['3'] },
  descInput: { height: 80, textAlignVertical: 'top', paddingTop: spacing['3'] },
  priceField: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  currencyBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  currencyText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  uploadCard: {
    padding: spacing['3'],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.20)',
    gap: spacing['3'],
  },
  uploadCenter: { alignItems: 'center', gap: spacing['1'] },
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
    color: palette.ink.onDarkSoft,
  },
  uploadCount: {
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  thumbsRow: { gap: spacing['2'] },
  thumbCell: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbAdd: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxWrap: { paddingVertical: spacing['1'] },
  cbLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  cbHighlight: {
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  actions: { paddingVertical: spacing['4'] },
});
