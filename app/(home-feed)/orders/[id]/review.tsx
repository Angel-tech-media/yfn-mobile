import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { pick, pickMany } = useImagePicker();

  const fromCamera = async () => {
    const img = await pick('camera');
    if (img) setImages((arr) => [...arr, img].slice(0, 4));
  };
  const fromGallery = async () => {
    const remaining = 4 - images.length;
    if (remaining <= 0) return;
    const picked = await pickMany(remaining);
    if (picked.length) setImages((arr) => [...arr, ...picked].slice(0, 4));
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Leave a review" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Order #{id}</Text>
        <Text style={styles.title}>How would you rate this order?</Text>

        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < rating;
            return (
              <Pressable key={i} onPress={() => setRating(i + 1)} hitSlop={4}>
                <Ionicons
                  name={filled ? 'star' : 'star-outline'}
                  size={36}
                  color={filled ? palette.brand.amber : palette.ink.onDarkMuted}
                />
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Tell us more</Text>
        <TextField
          placeholder="Share what worked well or what could be better"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={4}
          style={styles.bodyInput}
        />

        <Text style={styles.sectionLabel}>Add photos · {images.length}/4</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
          {images.map((img, i) => (
            <View key={img.uri + i} style={styles.thumbCell}>
              <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <Pressable
                onPress={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                hitSlop={6}
                style={styles.thumbDelete}>
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
          {images.length < 4 ? (
            <Pressable onPress={() => setSheetOpen(true)} style={styles.thumbAdd}>
              <Ionicons name="add" size={24} color={palette.ink.onDarkSoft} />
            </Pressable>
          ) : null}
        </ScrollView>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Submit review" disabled={rating === 0} onPress={() => router.back()} />
      </View>

      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={fromCamera}
        onGallery={fromGallery}
        title="Add review photos"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], paddingBottom: 40, gap: spacing['3'] },
  kicker: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: palette.ink.onDarkStrong,
  },
  starsRow: { flexDirection: 'row', gap: spacing['2'], paddingVertical: spacing['2'] },
  sectionLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkSoft,
  },
  bodyInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing['3'],
  },
  thumbsRow: { gap: spacing['2'] },
  thumbCell: {
    width: 80,
    height: 80,
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
    width: 80,
    height: 80,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { paddingVertical: spacing['3'] },
});
