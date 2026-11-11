import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useMe } from '@/src/api/account/hooks';
import { useCreatePost } from '@/src/api/feed/hooks';
import { useToast } from '@/src/hooks/use-toast';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useUser } from '@/src/store/user';
import { continuous, useUi } from '@/src/theme/ui';
import { apiErrorMessage } from '@/src/utils/api-error-message';
import { logApiFailure } from '@/src/utils/api-logging';
import { assetUploadErrorMessage, uploadLocalAssets } from '@/src/utils/upload-media';

const MAX_IMAGES = 6;
const MAX_CHARS = 280;
const LOCATION_PRESETS = ['Yaba, Lagos', 'Lekki Phase 1', 'Victoria Island', 'Surulere, Lagos', 'Ikeja, Lagos'];

type SelectedLocation = {
  label: string;
  lat?: number;
  lng?: number;
};

export default function CreatePostScreen() {
  const ui = useUi();
  const [text, setText] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [isUploading, setUploading] = useState(false);

  const { pick, pickMany } = useImagePicker();
  const { data: me } = useMe();
  const role = useUser((s) => s.role);
  const isVendor = role === 'vendor';
  const createPost = useCreatePost();
  const toast = useToast();

  const charsLeft = MAX_CHARS - text.length;

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

  const caption = captionForPost(text, selectedLocation);
  const canPost = (caption.length > 0 || images.length > 0) && charsLeft >= 0;
  const isSubmitting = isUploading || createPost.isPending;

  const addEmoji = (emoji: string) => {
    setText((value) => `${value}${emoji}`);
    setEmojiOpen(false);
  };

  const selectCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Location permission not granted');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const parts = [place?.district, place?.city, place?.region].filter(Boolean);
      setSelectedLocation({
        label: parts.length ? parts.slice(0, 2).join(', ') : 'Lagos, Nigeria',
        lat: latitude,
        lng: longitude,
      });
      setLocationOpen(false);
    } catch {
      toast.error('Could not detect location');
    } finally {
      setLocating(false);
    }
  };

  const handlePost = async () => {
    if (!canPost || isSubmitting) return;
    setUploading(true);
    let mediaIds: string[];
    try {
      const uploaded = await uploadLocalAssets(images, 'post');
      mediaIds = uploaded.map((asset) => asset.mediaId);
    } catch (err) {
      toast.error('Upload failed', { description: assetUploadErrorMessage(err) });
      setUploading(false);
      return;
    }

    try {
      await createPost.mutateAsync({
        caption,
        mediaIds,
      });
      toast.success('Posted!');
      router.back();
    } catch (err) {
      logApiFailure('POST /posts', err, { endpoint: 'POST /posts' });
      toast.error('Could not publish post', { description: apiErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const displayName = me?.name || me?.displayName || me?.username || 'Me';

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="New post"
        showBack
        rightAction={
          <Pressable
            disabled={!canPost || isSubmitting}
            hitSlop={8}
            onPress={handlePost}
            style={[
              styles.postPill,
              { backgroundColor: ui.accent },
              (!canPost || isSubmitting) && { opacity: 0.45 },
            ]}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={ui.onAccent} />
            ) : (
              <Text style={[styles.postBtnText, { color: ui.onAccent }]}>Post</Text>
            )}
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <View style={styles.composerRow}>
          <Avatar
            size={42}
            source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
            initials={initialsFor(displayName)}
          />
          <TextInput
            autoFocus
            multiline
            value={text}
            onChangeText={setText}
            placeholder={isVendor ? "What's dropping at your store?" : "What's the gist?"}
            placeholderTextColor={ui.secondaryLabel}
            style={[styles.realInput, { color: ui.label }]}
          />
        </View>

        {selectedLocation ? (
          <View style={[styles.locationPill, { backgroundColor: ui.secondary }]}>
            <Ionicons name="location" size={14} color={ui.accent} />
            <Text style={[styles.locationText, { color: ui.label }]} numberOfLines={1}>
              {selectedLocation.label}
            </Text>
            <Pressable onPress={() => setSelectedLocation(null)} hitSlop={8}>
              <Ionicons name="close" size={14} color={ui.secondaryLabel} />
            </Pressable>
          </View>
        ) : null}

        {images.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbsRow}>
            {images.map((img, i) => (
              <View key={img.uri + i} style={styles.thumbCell}>
                <Image
                  source={{ uri: img.uri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                  hitSlop={6}
                  style={styles.thumbDelete}>
                  <Ionicons name="close" size={13} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </ScrollView>

      {/* Lovable Bottom Composer Toolbar */}
      <View style={[styles.toolRow, { borderTopColor: ui.separator }]}>
        <View style={styles.toolBtnsLeft}>
          <Pressable
            onPress={() => setSheetOpen(true)}
            style={[styles.toolBtn, { backgroundColor: ui.secondary }]}>
            <Ionicons name="image-outline" size={18} color={ui.label} />
            <Text style={[styles.toolLabel, { color: ui.label }]}>Photo</Text>
          </Pressable>
          <Pressable
            onPress={() => setLocationOpen(true)}
            style={[styles.toolBtn, { backgroundColor: ui.secondary }]}>
            <Ionicons name="location-outline" size={18} color={ui.label} />
            <Text style={[styles.toolLabel, { color: ui.label }]}>Location</Text>
          </Pressable>
          <Pressable
            onPress={() => setEmojiOpen(true)}
            style={[styles.toolBtn, { backgroundColor: ui.secondary }]}>
            <Ionicons name="happy-outline" size={18} color={ui.label} />
          </Pressable>
        </View>

        <Text
          style={[
            styles.charCount,
            { color: charsLeft < 20 ? ui.coral : ui.secondaryLabel },
          ]}>
          {charsLeft}
        </Text>
      </View>

      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={fromCamera}
        onGallery={fromGallery}
        title="Add photos"
      />

      {emojiOpen && (
        <EmojiPicker onEmojiSelected={addEmoji} onClose={() => setEmojiOpen(false)} />
      )}

      <BottomSheet visible={locationOpen} onClose={() => setLocationOpen(false)}>
        <Text style={[styles.sheetTitle, { color: ui.label }]}>Tag location</Text>
        <Pressable
          onPress={selectCurrentLocation}
          style={[styles.locationOptionRow, { borderBottomColor: ui.separator }]}>
          <Ionicons name="navigate" size={18} color={ui.accent} />
          <Text style={[styles.locationOptionLabel, { color: ui.label }]}>
            {locating ? 'Detecting location…' : 'Use current location'}
          </Text>
        </Pressable>
        {LOCATION_PRESETS.map((label) => (
          <Pressable
            key={label}
            onPress={() => {
              setSelectedLocation({ label });
              setLocationOpen(false);
            }}
            style={[styles.locationOptionRow, { borderBottomColor: ui.separator }]}>
            <Ionicons name="location-outline" size={18} color={ui.secondaryLabel} />
            <Text style={[styles.locationOptionLabel, { color: ui.label }]}>{label}</Text>
          </Pressable>
        ))}
      </BottomSheet>
    </ScreenContainer>
  );
}

function initialsFor(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'A'
  );
}

function captionForPost(value: string, location: SelectedLocation | null) {
  const caption = value.trim();
  if (!location) return caption;
  const locationLine = `📍 ${location.label}`;
  return caption ? `${caption}\n\n${locationLine}` : locationLine;
}

const styles = StyleSheet.create({
  postPill: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 13,
  },
  scroll: {
    paddingTop: 12,
    paddingBottom: 60,
    gap: 14,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  realInput: {
    flex: 1,
    minHeight: 160,
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 17,
    lineHeight: 24,
    textAlignVertical: 'top',
    paddingTop: 4,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  locationText: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
  },
  thumbsRow: {
    gap: 10,
  },
  thumbCell: {
    width: 100,
    height: 124,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...continuous,
  },
  thumbDelete: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 21, 19, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolBtnsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toolLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 13,
  },
  charCount: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 13,
  },
  sheetTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    marginBottom: 12,
  },
  locationOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  locationOptionLabel: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
  },
});
