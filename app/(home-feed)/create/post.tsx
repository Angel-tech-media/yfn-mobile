import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';

const MAX_IMAGES = 6;

export default function CreatePostScreen() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [taggedProduct, setTaggedProduct] = useState<string | null>(null);
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

  const canPost = text.trim().length > 0 || images.length > 0;

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="New post"
        showBack
        rightAction={
          <Pressable disabled={!canPost} hitSlop={8} onPress={() => router.back()}>
            <Text style={[styles.postBtn, !canPost && { opacity: 0.5 }]}>Post</Text>
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Avatar size={40} initials="DO" />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>David Okpo</Text>
            <View style={styles.audienceRow}>
              <Ionicons name="earth" size={12} color={palette.ink.onDarkSoft} />
              <Text style={styles.audience}>Public</Text>
              <Ionicons name="chevron-down" size={12} color={palette.ink.onDarkSoft} />
            </View>
          </View>
        </View>

        <Text
          accessibilityLabel="Post text"
          style={styles.textInput}
          onPress={() => {}}>
          <Text style={text ? styles.textValue : styles.textPlaceholder}>
            {text || "What's on your mind?"}
          </Text>
        </Text>
        <View style={styles.textInputCover}>
          <PostTextInput value={text} onChange={setText} />
        </View>

        {images.length > 0 ? (
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
          </ScrollView>
        ) : null}

        {taggedProduct ? (
          <View style={styles.tagPill}>
            <Ionicons name="pricetag" size={14} color={palette.brand.orange} />
            <Text style={styles.tagText}>Tagged · Ankara high shoulder fitted gown</Text>
            <Pressable onPress={() => setTaggedProduct(null)} hitSlop={6}>
              <Ionicons name="close" size={14} color={palette.ink.onDarkSoft} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.toolRow}>
        <ToolBtn icon="image-outline" label="Photo" onPress={() => setSheetOpen(true)} />
        <ToolBtn icon="pricetag-outline" label="Tag product" onPress={() => setTaggedProduct('p1')} />
        <ToolBtn icon="happy-outline" label="Feeling" onPress={() => {}} />
        <ToolBtn icon="location-outline" label="Location" onPress={() => {}} />
      </View>

      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={fromCamera}
        onGallery={fromGallery}
        title="Add photos"
      />
    </ScreenContainer>
  );
}

function PostTextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // We render an actual TextInput offset/scrolled with the screen
  const { TextInput } = require('react-native');
  return (
    <TextInput
      placeholder="What's on your mind?"
      placeholderTextColor={palette.ink.onDarkMuted}
      multiline
      value={value}
      onChangeText={onChange}
      style={styles.realInput}
    />
  );
}

function ToolBtn({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.toolBtn, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={palette.brand.orange} />
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  postBtn: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.brand.orange,
  },
  scroll: { paddingVertical: spacing['3'], gap: spacing['3'], paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  author: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  audience: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  textInput: { display: 'none' },
  textValue: { color: palette.ink.onDarkStrong },
  textPlaceholder: { color: palette.ink.onDarkMuted },
  textInputCover: {},
  realInput: {
    minHeight: 120,
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    color: palette.ink.onDarkStrong,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  thumbsRow: { gap: spacing['2'] },
  thumbCell: {
    width: 96,
    height: 120,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(253,134,22,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(253,134,22,0.40)',
  },
  tagText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  toolRow: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
    flexWrap: 'wrap',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  toolLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
  },
});
