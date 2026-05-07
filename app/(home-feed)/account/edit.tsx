import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { palette, spacing, typography } from '@/src/theme';

export default function EditProfileScreen() {
  const [name, setName] = useState('David Okpo');
  const [handle, setHandle] = useState('davidokpo');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { pick } = useImagePicker();

  const handlePick = async (source: 'camera' | 'library') => {
    const img = await pick(source);
    if (img) setPhoto(img);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Edit profile" showBack />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarBlock}>
          {photo ? (
            <View style={styles.avatarFrame}>
              <Image source={{ uri: photo.uri }} style={styles.avatarImage} contentFit="cover" />
            </View>
          ) : (
            <Avatar size={108} initials="DO" />
          )}
          <Pressable
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [styles.changeBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="camera" size={14} color={palette.ink.onDarkStrong} />
            <Text style={styles.changeLabel}>Change photo</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <TextField label="Name" value={name} onChangeText={setName} />
          <TextField
            label="Handle"
            value={handle}
            onChangeText={(t) => setHandle(t.replace(/[^a-z0-9_.]/gi, '').toLowerCase())}
            autoCapitalize="none"
          />
          <TextField
            label="Bio"
            placeholder="Tell people about yourself…"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.bioInput}
          />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Save changes" onPress={() => router.back()} />
      </View>

      <UploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCamera={() => handlePick('camera')}
        onGallery={() => handlePick('library')}
        title="Profile photo"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: spacing['3'], paddingBottom: 40 },
  avatarBlock: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['5'],
  },
  avatarFrame: {
    width: 108,
    height: 108,
    borderRadius: 54,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  changeLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkStrong,
  },
  form: { gap: spacing['3'] },
  bioInput: { height: 80, textAlignVertical: 'top', paddingTop: spacing['3'] },
  actions: { paddingVertical: spacing['3'] },
});
