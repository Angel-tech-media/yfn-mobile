import { useCallback } from 'react';

import { Alert, Linking } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

type Source = 'camera' | 'library';

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
  mediaType?: 'image' | 'video' | 'livePhoto' | 'pairedVideo' | null;
  fileName?: string;
  contentType: string;
  sizeBytes?: number;
  durationMs?: number;
};

export function useImagePicker() {
  const pick = useCallback(
    async (source: Source, opts?: ImagePicker.ImagePickerOptions): Promise<PickedImage | null> => {
      const baseOpts: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.85,
        ...opts,
      };

      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          promptOpenSettings('camera');
          return null;
        }
        try {
          result = await ImagePicker.launchCameraAsync(baseOpts);
        } catch (e) {
          Alert.alert('Camera unavailable', errorMessage(e));
          return null;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          promptOpenSettings('photos');
          return null;
        }
        try {
          result = await ImagePicker.launchImageLibraryAsync(baseOpts);
        } catch (e) {
          Alert.alert('Photos unavailable', errorMessage(e));
          return null;
        }
      }

      if (result.canceled) return null;
      const [asset] = result.assets;
      return normalizeAsset(asset);
    },
    []
  );

  const pickMany = useCallback(
    async (limit: number, opts?: ImagePicker.ImagePickerOptions): Promise<PickedImage[]> => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        promptOpenSettings('photos');
        return [];
      }
      let result: ImagePicker.ImagePickerResult;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: limit,
          quality: 0.85,
          ...opts,
        });
      } catch (e) {
        Alert.alert('Photos unavailable', errorMessage(e));
        return [];
      }
      if (result.canceled) return [];
      return result.assets.map(normalizeAsset);
    },
    []
  );

  return { pick, pickMany };
}

function normalizeAsset(asset: ImagePicker.ImagePickerAsset): PickedImage {
  const contentType = asset.mimeType ?? inferContentType(asset.uri, asset.type);

  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    mediaType: asset.type,
    fileName: asset.fileName ?? fileNameFor(asset.uri, contentType),
    contentType,
    sizeBytes: asset.fileSize && asset.fileSize > 0 ? asset.fileSize : undefined,
    durationMs: asset.duration ?? undefined,
  };
}

function inferContentType(uri: string, mediaType?: PickedImage['mediaType']): string {
  const lower = uri.toLowerCase().split('?')[0] ?? '';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.heif')) return 'image/heif';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.m4v')) return 'video/x-m4v';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  return mediaType === 'video' || mediaType === 'pairedVideo' ? 'video/mp4' : 'image/jpeg';
}

function fileNameFor(uri: string, contentType: string): string {
  const fromUri = uri.split('?')[0]?.split('/').pop();
  if (fromUri?.includes('.')) return fromUri;
  const ext = extensionFor(contentType);
  return `upload-${Date.now()}.${ext}`;
}

function extensionFor(contentType: string): string {
  if (contentType === 'image/jpeg') return 'jpg';
  if (contentType === 'video/quicktime') return 'mov';
  return contentType.split('/')[1] || 'bin';
}

function promptOpenSettings(kind: 'camera' | 'photos') {
  Alert.alert(
    `Permission needed`,
    `Aktive needs access to your ${kind} to continue.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Please try again.';
}
