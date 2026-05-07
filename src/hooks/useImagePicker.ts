import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

type Source = 'camera' | 'library';

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
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
        result = await ImagePicker.launchCameraAsync(baseOpts);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          promptOpenSettings('photos');
          return null;
        }
        result = await ImagePicker.launchImageLibraryAsync(baseOpts);
      }

      if (result.canceled) return null;
      const asset = result.assets[0];
      return { uri: asset.uri, width: asset.width, height: asset.height };
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: limit,
        quality: 0.85,
        ...opts,
      });
      if (result.canceled) return [];
      return result.assets.map((a) => ({ uri: a.uri, width: a.width, height: a.height }));
    },
    []
  );

  return { pick, pickMany };
}

function promptOpenSettings(kind: 'camera' | 'photos') {
  Alert.alert(
    `Permission needed`,
    `Vibe needs access to your ${kind} to continue.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
}
