import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useMe } from '@/src/api/account/hooks';
import { useEditPost } from '@/src/api/feed/hooks';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useToast } from '@/src/hooks/use-toast';
import { palette, radius, spacing, typography } from '@/src/theme';
import { apiErrorMessage } from '@/src/utils/api-error-message';
import { logApiFailure } from '@/src/utils/api-logging';
import { assetUploadErrorMessage, uploadLocalAssets } from '@/src/utils/upload-media';

const MAX_IMAGES = 6;
const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🥳', '🔥', '✨', '🙌', '👏', '🙏', '💛', '🛍️', '📸', '🎶', '🍔', '☕', '🏆', '🌍', '📍'];
const LOCATION_PRESETS = ['Yaba, Lagos', 'Lekki Phase 1', 'Victoria Island', 'Ikeja, Lagos', 'Abuja, Nigeria'];

type SelectedLocation = {
  label: string;
  lat?: number;
  lng?: number;
};

export default function EditPostScreen() {
  const { id, initialCaption } = useLocalSearchParams<{ id: string; initialCaption?: string }>();
  const [text, setText] = useState(initialCaption || '');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<SelectedLocation[]>([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const { pick, pickMany } = useImagePicker();
  const { data: me } = useMe();
  const editPost = useEditPost();
  const toast = useToast();

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
  const canPost = caption.length > 0 || images.length > 0;
  const isSubmitting = isUploading || editPost.isPending;

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
        toast.error('Location unavailable', {
          description: 'Location permission was not granted.',
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setSelectedLocation({
        label: locationLabelFor(place, latitude, longitude),
        lat: latitude,
        lng: longitude,
      });
      setLocationOpen(false);
    } catch (err) {
      console.error('[location] edit post location selection failed', err);
      toast.error('Could not select location', {
        description: 'Please try again or choose a nearby place.',
      });
    } finally {
      setLocating(false);
    }
  };

  const searchLocation = async () => {
    const query = locationQuery.trim();
    if (!query || locationSearching) return;
    setLocationSearching(true);
    try {
      const matches = await Location.geocodeAsync(query);
      const results = await Promise.all(
        matches.slice(0, 5).map(async (match) => {
          const [place] = await Location.reverseGeocodeAsync({
            latitude: match.latitude,
            longitude: match.longitude,
          });
          return {
            label: locationLabelFor(place, match.latitude, match.longitude, query),
            lat: match.latitude,
            lng: match.longitude,
          };
        }),
      );
      setLocationResults(results);
      if (!results.length) {
        toast.error('No locations found', {
          description: 'Try a more specific city, landmark, or address.',
        });
      }
    } catch (err) {
      console.error('[location] edit post location search failed', err);
      toast.error('Could not search location', {
        description: 'Please check the spelling and try again.',
      });
    } finally {
      setLocationSearching(false);
    }
  };

  const handleEdit = async () => {
    if (!canPost || isSubmitting) return;
    setUploading(true);
    let mediaIds: string[] | undefined;
    
    if (images.length > 0) {
      try {
        const uploaded = await uploadLocalAssets(images, 'post');
        mediaIds = uploaded.map((asset) => asset.mediaId);
      } catch (err) {
        toast.error('Upload failed', {
          description: assetUploadErrorMessage(err),
        });
        setUploading(false);
        return;
      }
    }

    try {
      await editPost.mutateAsync({
        postId: id,
        input: {
          caption,
          ...(mediaIds ? { mediaIds } : {}),
        }
      });
      toast.success('Post updated!', {
        icon: 'checkmark-circle',
      });
      router.back();
    } catch (err) {
      logApiFailure('PATCH /posts/:id', err, {
        endpoint: 'PATCH /posts/:id',
        flow: 'edit-post',
        mediaIds,
        mediaCount: mediaIds?.length,
        captionLength: caption.length,
        location: selectedLocation,
      });
      toast.error('Could not update post', {
        description: apiErrorMessage(err),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Edit post"
        showBack
        rightAction={
          <Pressable
            disabled={!canPost || isSubmitting}
            hitSlop={8}
            onPress={handleEdit}
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, (!canPost || isSubmitting) && { opacity: 0.5 }]}
          >
            {isSubmitting && <ActivityIndicator size="small" color={palette.brand.orange} />}
            <Text style={styles.postBtn}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Avatar
            size={40}
            source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
            initials={initialsFor(me?.name || me?.displayName || me?.username || 'Me')}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>{me?.name || me?.displayName || me?.username || 'Me'}</Text>
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

        {selectedLocation ? (
          <View style={styles.locationPill}>
            <Ionicons name="location" size={14} color={palette.brand.orange} />
            <Text style={styles.locationText} numberOfLines={1}>{selectedLocation.label}</Text>
            <Pressable onPress={() => setSelectedLocation(null)} hitSlop={8}>
              <Ionicons name="close" size={14} color={palette.ink.onDarkSoft} />
            </Pressable>
          </View>
        ) : null}

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


      </ScrollView>

      <View style={styles.toolRow}>
        <ToolBtn icon="image-outline" label="Photo" onPress={() => setSheetOpen(true)} />
        <ToolBtn icon="happy-outline" label="Feeling" onPress={() => setEmojiOpen(true)} />
        <ToolBtn
          icon="location-outline"
          label={selectedLocation ? 'Location added' : 'Location'}
          active={Boolean(selectedLocation)}
          onPress={() => setLocationOpen(true)}
        />
      </View>

      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={fromCamera}
        onGallery={fromGallery}
        title="Add photos"
      />

      <BottomSheet visible={emojiOpen} onClose={() => setEmojiOpen(false)}>
        <Text style={styles.sheetTitle}>Feeling</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => addEmoji(emoji)}
              style={({ pressed }) => [styles.emojiBtn, pressed && { opacity: 0.7 }]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={locationOpen} onClose={() => setLocationOpen(false)}>
        <Text style={styles.sheetTitle}>Location</Text>
        <View style={styles.locationSearchWrap}>
          <Ionicons name="search" size={18} color={palette.ink.onDarkMuted} />
          <TextInput
            value={locationQuery}
            onChangeText={(value) => {
              setLocationQuery(value);
              if (!value.trim()) setLocationResults([]);
            }}
            onSubmitEditing={searchLocation}
            returnKeyType="search"
            placeholder="Search city, landmark, or address"
            placeholderTextColor={palette.ink.onDarkMuted}
            style={styles.locationSearchInput}
          />
          <Pressable
            onPress={searchLocation}
            disabled={!locationQuery.trim() || locationSearching}
            hitSlop={8}
            style={[styles.locationSearchBtn, (!locationQuery.trim() || locationSearching) && { opacity: 0.45 }]}>
            {locationSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={selectCurrentLocation}
          disabled={locating}
          style={({ pressed }) => [styles.locationRow, pressed && { opacity: 0.82 }]}>
          <View style={styles.locationIcon}>
            {locating ? (
              <ActivityIndicator size="small" color={palette.brand.orange} />
            ) : (
              <Ionicons name="navigate" size={18} color={palette.brand.orange} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationRowTitle}>{locating ? 'Finding location' : 'Current location'}</Text>
            <Text style={styles.locationRowMeta}>Use device location</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={palette.ink.onDarkMuted} />
        </Pressable>

        {locationResults.map((result) => {
          const selected = selectedLocation?.label === result.label;
          return (
            <Pressable
              key={`${result.label}-${result.lat ?? ''}-${result.lng ?? ''}`}
              onPress={() => {
                setSelectedLocation(result);
                setLocationOpen(false);
              }}
              style={({ pressed }) => [styles.locationRow, pressed && { opacity: 0.82 }]}>
              <View style={styles.locationIcon}>
                <Ionicons name="pin" size={18} color={palette.brand.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.locationRowTitle} numberOfLines={1}>{result.label}</Text>
                {result.lat && result.lng ? (
                  <Text style={styles.locationRowMeta}>{result.lat.toFixed(4)}, {result.lng.toFixed(4)}</Text>
                ) : null}
              </View>
              {selected ? (
                <Ionicons name="checkmark" size={18} color={palette.brand.orange} />
              ) : null}
            </Pressable>
          );
        })}

        {LOCATION_PRESETS.filter((label) => matchesLocationQuery(label, locationQuery)).map((label) => {
          const selected = selectedLocation?.label === label;
          return (
            <Pressable
              key={label}
              onPress={() => {
                setSelectedLocation({ label });
                setLocationOpen(false);
              }}
              style={({ pressed }) => [styles.locationRow, pressed && { opacity: 0.82 }]}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={18} color={palette.brand.orange} />
              </View>
              <Text style={[styles.locationRowTitle, { flex: 1 }]}>{label}</Text>
              {selected ? (
                <Ionicons name="checkmark" size={18} color={palette.brand.orange} />
              ) : null}
            </Pressable>
          );
        })}

        {selectedLocation ? (
          <Pressable onPress={() => {
            setSelectedLocation(null);
            setLocationOpen(false);
          }} style={styles.removeLocationBtn}>
            <Text style={styles.removeLocationText}>Remove location</Text>
          </Pressable>
        ) : null}
      </BottomSheet>
    </ScreenContainer>
  );
}

function PostTextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

function ToolBtn({
  icon,
  label,
  onPress,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.toolBtn, active && styles.toolBtnActive, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={palette.brand.orange} />
      <Text style={styles.toolLabel}>{label}</Text>
    </Pressable>
  );
}

function captionForPost(value: string, location: SelectedLocation | null) {
  const caption = value.trim();
  if (!location) return caption;
  const locationLine = `📍 ${location.label}`;
  return caption ? `${caption}\n\n${locationLine}` : locationLine;
}

function locationLabelFor(
  place: Location.LocationGeocodedAddress | undefined,
  latitude: number,
  longitude: number,
  fallback?: string,
) {
  const parts = [
    place?.name,
    place?.district,
    place?.city,
    place?.region,
    place?.country,
  ].filter((part): part is string => Boolean(part));

  if (parts.length) return Array.from(new Set(parts)).slice(0, 3).join(', ');
  if (fallback?.trim()) return fallback.trim();
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function matchesLocationQuery(label: string, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return label.toLowerCase().includes(normalized);
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(47, 107, 255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255,0.32)',
  },
  locationText: {
    flexShrink: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
    backgroundColor: 'rgba(47, 107, 255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255,0.40)',
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
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    flexWrap: 'wrap',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  toolBtnActive: {
    backgroundColor: 'rgba(47, 107, 255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255,0.28)',
  },
  toolLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
  },
  sheetTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['3'],
  },
  locationSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    minHeight: 48,
    paddingLeft: spacing['3'],
    paddingRight: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    marginBottom: spacing['2'],
  },
  locationSearchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
    paddingVertical: 0,
  },
  locationSearchBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  emojiBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  emoji: {
    fontSize: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    minHeight: 56,
    paddingVertical: spacing['2'],
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 107, 255,0.12)',
  },
  locationRowTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  locationRowMeta: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  removeLocationBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  removeLocationText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.status.danger,
  },
});
