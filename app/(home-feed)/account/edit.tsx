import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useMe, useUpdateMe } from '@/src/api/account/hooks';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useToast } from '@/src/hooks/use-toast';
import { queryKeys } from '@/src/api/query-keys';
import type { MeResponse } from '@/src/api/types';
import { palette, spacing, typography } from '@/src/theme';
import { assetUploadErrorMessage } from '@/src/utils/upload-media';
import { accountApi } from '@/src/api/account';

export default function EditProfileScreen() {
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { pick } = useImagePicker();
  const toast = useToast();

  useEffect(() => {
    if (!me) return;
    setName(me.name || me.displayName || '');
    setHandle(me.handle || me.username || '');
    setBio(me.bio ?? '');
  }, [me]);

  const handlePick = async (source: 'camera' | 'library') => {
    const img = await pick(source);
    if (img) setPhoto(img);
  };

  const updateFeedCache = (updatedMe: MeResponse) => {
    queryClient.setQueriesData({ predicate: (q) => q.queryKey[0] === 'feed' || q.queryKey[0] === 'posts' }, (oldData: any) => {
      if (!oldData) return oldData;

      const updateAuthor = (author: any) => {
        if (!author || author.handle !== me?.handle) return author;
        return {
          ...author,
          name: updatedMe.name || updatedMe.displayName || author.name,
          handle: updatedMe.handle || updatedMe.username || author.handle,
          avatarUrl: updatedMe.avatarUrl
        };
      };

      if (oldData.items && Array.isArray(oldData.items)) {
        return {
          ...oldData,
          items: oldData.items.map((item: any) => ({
            ...item,
            author: updateAuthor(item.author)
          }))
        };
      }
      if (Array.isArray(oldData)) {
        return oldData.map((item: any) => ({
          ...item,
          author: updateAuthor(item.author)
        }));
      }
      if (oldData.comments && Array.isArray(oldData.comments)) {
        return {
          ...oldData,
          comments: oldData.comments.map((item: any) => ({
            ...item,
            author: updateAuthor(item.author)
          }))
        };
      }
      
      // Single post or story object
      if (oldData.author && oldData.id && typeof oldData.id === 'string') {
        return {
          ...oldData,
          author: updateAuthor(oldData.author)
        };
      }

      return oldData;
    });
  };

  const save = async () => {
    setIsUploading(true);

    if (photo) {
      try {
        const result = await accountApi.updateProfileAvatar(photo);
        queryClient.setQueryData(queryKeys.account.me, result);
        updateFeedCache(result);
      } catch (err) {
        toast.error('Upload failed', {
          description: assetUploadErrorMessage(err),
        });
        setIsUploading(false);
        return;
      }
    }

    updateMe.mutate(
      {
        displayName: name.trim(),
        username: handle.trim(),
        bio: bio.trim(),
      },
      {
        onSuccess: (updatedMe) => {
          updateFeedCache(updatedMe);
          setIsUploading(false);
          router.back();
        },
        onError: () => setIsUploading(false),
      },
    );
  };

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ME';

  return (
    <ScreenContainer variant="espresso">
      <TopBar title="Edit profile" showBack />
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={palette.brand.orange} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarBlock}>
          {photo ? (
            <View style={styles.avatarFrame}>
              <Image source={{ uri: photo.uri }} style={styles.avatarImage} contentFit="cover" />
            </View>
          ) : me?.avatarUrl ? (
            <Avatar size={108} source={{ uri: me.avatarUrl }} initials={initials} />
          ) : (
            <Avatar size={108} initials={initials} />
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
      )}

      <View style={styles.actions}>
        <PrimaryButton
          label="Save changes"
          loading={updateMe.isPending || isUploading}
          disabled={!name.trim() || !handle.trim() || updateMe.isPending || isUploading}
          onPress={save}
        />
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
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
