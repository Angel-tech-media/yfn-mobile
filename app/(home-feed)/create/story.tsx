import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateStory } from '@/src/api/feed/hooks';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useToast } from '@/src/hooks/use-toast';
import { palette, spacing, typography } from '@/src/theme';
import { apiErrorMessage } from '@/src/utils/api-error-message';
import { logApiFailure } from '@/src/utils/api-logging';
import { assetUploadErrorMessage, uploadLocalAsset } from '@/src/utils/upload-media';

export default function CreateStoryScreen() {
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [caption, setCaption] = useState('');
  const [textEditing, setTextEditing] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const { pick } = useImagePicker();
  const createStory = useCreateStory();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Auto-launch camera on mount
    (async () => {
      const img = await pick('camera');
      if (img) setPhoto(img);
    })();
  }, [pick]);

  if (!photo) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#1A1812', '#0A0805']} style={StyleSheet.absoluteFill} />
        <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={styles.center}>
            <Pressable onPress={async () => {
              const img = await pick('camera');
              if (img) setPhoto(img);
            }} style={styles.captureWrap}>
              <View style={styles.captureRing}>
                <View style={styles.captureCenter} />
              </View>
              <Text style={styles.captureLabel}>Tap to capture</Text>
            </Pressable>
            <Pressable onPress={async () => {
              const img = await pick('library');
              if (img) setPhoto(img);
            }} style={styles.galleryBtn}>
              <Ionicons name="images-outline" size={18} color="#FFFFFF" />
              <Text style={styles.galleryLabel}>Choose from gallery</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent']}
        style={[StyleSheet.absoluteFill, { bottom: '70%' }]}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={[StyleSheet.absoluteFill, { top: '50%' }]}
      />

      <View style={[styles.safe, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => setPhoto(null)} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.toolStack}>
            <Pressable onPress={() => setTextEditing(true)} hitSlop={8} style={[styles.iconBtn, (textEditing || caption) && styles.iconBtnActive]}>
              <Ionicons name="text" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="happy-outline" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="musical-notes-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.captionWrap} onPress={() => setTextEditing(true)}>
          {textEditing || caption ? (
            <View style={styles.storyTextBox}>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                autoFocus={textEditing}
                multiline
                maxLength={160}
                placeholder="Add text"
                placeholderTextColor="rgba(255,255,255,0.70)"
                onBlur={() => setTextEditing(false)}
                style={styles.storyTextInput}
              />
            </View>
          ) : null}
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            disabled={createStory.isPending || isUploading}
            onPress={async () => {
              if (!photo || createStory.isPending || isUploading) return;
              setUploading(true);
              let mediaId: string;
              try {
                const uploaded = await uploadLocalAsset(photo, 'story');
                mediaId = uploaded.mediaId;
              } catch (err) {
                toast.error('Upload failed', {
                  description: assetUploadErrorMessage(err),
                });
                setUploading(false);
                return;
              }

              try {
                await createStory.mutateAsync({
                  mediaId,
                  caption: caption.trim() || undefined,
                });
                toast.success('Story shared!', {
                  icon: 'sparkles',
                });
                router.back();
              } catch (err) {
                logApiFailure('POST /stories', err, {
                  endpoint: 'POST /stories',
                  flow: 'story',
                  mediaId,
                  captionLength: caption.trim().length,
                });
                toast.error('Could not share story', {
                  description: apiErrorMessage(err),
                });
              } finally {
                setUploading(false);
              }
            }}
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="paper-plane" size={18} color={palette.ink.onLightStrong} />
            <Text style={styles.shareLabel}>{createStory.isPending || isUploading ? 'Sharing' : 'Share to Story'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(216, 149, 68, 0.78)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing['2'] },
  toolStack: { gap: spacing['2'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['4'] },
  captureWrap: { alignItems: 'center', gap: spacing['2'] },
  captureRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  captureLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  galleryLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
  },
  captionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3'],
  },
  storyTextBox: {
    minWidth: '66%',
    maxWidth: '96%',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  storyTextInput: {
    minHeight: 44,
    maxHeight: 180,
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: typography.h2.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: '#FFFFFF',
  },
  actions: { paddingBottom: spacing['4'] },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  shareLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    color: palette.ink.onLightStrong,
  },
});
