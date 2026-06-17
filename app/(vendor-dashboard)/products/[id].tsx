import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { Checkbox } from '@/components/ui/Checkbox';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useDeleteProduct, useProduct, useUpdateProduct } from '@/src/api/products/hooks';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';
import { koboToNaira, nairaToKobo } from '@/src/utils/money';
import { assetUploadErrorMessage, uploadLocalAssets } from '@/src/utils/upload-media';

const MAX_IMAGES = 6;

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = String(id ?? '');
  const { data: product, isLoading, isError, refetch, isFetching } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [outOfStock, setOutOfStock] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

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
  const isSaving = isUploading || updateProduct.isPending;

  useEffect(() => {
    if (!product) return;
    setName(product.title);
    setDesc(product.description ?? '');
    setCategory(product.category);
    setSalePrice(String(koboToNaira(product.price)));
    setOutOfStock(product.stock <= 0);
  }, [product]);

  const save = async () => {
    if (!canSave || isSaving || !product) return;
    setError(null);
    setUploading(true);
    let mediaIds = product.mediaIds ?? [];
    try {
      const uploaded = await uploadLocalAssets(images, 'product');
      mediaIds = [...mediaIds, ...uploaded.map((asset) => asset.mediaId)];
    } catch (err) {
      setError(assetUploadErrorMessage(err));
      setUploading(false);
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: productId,
        input: {
          title: name.trim(),
          description: desc.trim(),
          price: nairaToKobo(numericPrice),
          category: category.trim(),
          stock: outOfStock ? 0 : product?.stock ?? 1,
          active: !outOfStock,
          mediaIds,
        },
      });
      router.replace('/products/saved');
    } catch {
      setError('Could not save changes.');
    } finally {
      setUploading(false);
    }
  };

  const removeProduct = () => {
    deleteProduct.mutate(productId, { onSuccess: () => router.back() });
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Edit product"
        showBack
        rightAction={
          <Pressable hitSlop={8} disabled={deleteProduct.isPending} onPress={removeProduct}>
            <Ionicons name="trash-outline" size={20} color={palette.status.danger} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={palette.brand.orange} />
            <Text style={styles.emptyText}>Loading product…</Text>
          </View>
        ) : isError || !product ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Couldn&apos;t load product.</Text>
            <Pressable onPress={() => refetch()} disabled={isFetching}>
              <Text style={styles.retryText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
            </Pressable>
          </View>
        ) : (
        <>
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
          <TextField placeholder="Category tag" value={category} onChangeText={setCategory} />

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
              {(product.images ?? product.media?.map((asset) => asset.url) ?? []).map((url) => (
                <Image key={url} source={{ uri: url }} style={styles.thumbCell} contentFit="cover" />
              ))}
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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label="Save changes"
          loading={isSaving}
          disabled={!canSave || isSaving || !product}
          onPress={save}
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
  empty: { alignItems: 'center', paddingVertical: spacing['8'], gap: spacing['2'] },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  retryText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  idChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
    borderColor: 'rgba(0, 0, 0, 0.10)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbAdd: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.10)',
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
  errorText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.status.danger,
  },
});
