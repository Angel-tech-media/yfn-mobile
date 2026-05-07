import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';

type Slot = 'logo' | 'banner' | null;

export default function StoreDetailsScreen() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [logo, setLogo] = useState<PickedImage | null>(null);
  const [banner, setBanner] = useState<PickedImage | null>(null);
  const [activeSlot, setActiveSlot] = useState<Slot>(null);

  const { pick } = useImagePicker();

  const handlePick = async (source: 'camera' | 'library') => {
    const slot = activeSlot;
    setActiveSlot(null);
    if (!slot) return;
    const img = await pick(source);
    if (!img) return;
    if (slot === 'logo') setLogo(img);
    else setBanner(img);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Store details</Text>

        <View style={styles.form}>
          <TextField placeholder="Store name" value={name} onChangeText={setName} />
          <TextField
            placeholder="Store description/bio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />

          <UploadDropzone
            label="Upload store logo"
            image={logo}
            onPress={() => setActiveSlot('logo')}
            shape="round"
          />
          <UploadDropzone
            label="Upload store banner"
            image={banner}
            onPress={() => setActiveSlot('banner')}
            shape="wide"
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Business location</Text>
            <View style={styles.mapCard}>
              <View style={styles.mapPlaceholder}>
                <View style={styles.mapPin}>
                  <Ionicons name="location" size={14} color="#FFFFFF" />
                  <Text style={styles.mapPinLabel}>Choose on map</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label="Continue"
          onPress={() => router.push('/vendor-store-setup/first-listing')}
        />
      </View>

      <UploadSheet
        visible={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        onCamera={() => handlePick('camera')}
        onGallery={() => handlePick('library')}
        title={activeSlot === 'logo' ? 'Upload store logo' : 'Upload store banner'}
      />
    </ScreenContainer>
  );
}

function UploadDropzone({
  label,
  image,
  onPress,
  shape,
}: {
  label: string;
  image: PickedImage | null;
  onPress: () => void;
  shape: 'round' | 'wide';
}) {
  if (image) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.dropzoneFilled,
          shape === 'round' && { aspectRatio: 1, alignSelf: 'flex-start', width: 120, borderRadius: 60 },
          pressed && { opacity: 0.85 },
        ]}>
        <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.replaceBubble}>
          <Ionicons name="camera" size={14} color="#FFFFFF" />
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dropzone,
        shape === 'round' && { width: 120, height: 120, alignSelf: 'flex-start', borderRadius: 60 },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.uploadBubble}>
        <Ionicons name="image-outline" size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.dropzoneLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing['8'] },
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
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing['3'],
  },
  dropzone: {
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  dropzoneFilled: {
    height: 120,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  replaceBubble: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
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
  dropzoneLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  section: { gap: spacing['2'] },
  sectionLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  mapCard: {
    height: 160,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#A8C7B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: 999,
  },
  mapPinLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: '#1463B6',
  },
  actions: { paddingVertical: spacing['4'] },
});
