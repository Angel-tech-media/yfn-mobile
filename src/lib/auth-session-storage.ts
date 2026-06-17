import { Platform } from 'react-native';

import * as SecureStore from 'expo-secure-store';

const AUTH_SESSION_KEY = 'vibe.auth.session.v1';

function getWebStorage(): Storage | null {
  if (Platform.OS !== 'web') {
    return null;
  }

  try {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}

export const authSessionStorage = {
  async get(): Promise<string | null> {
    const webStorage = getWebStorage();
    if (webStorage) return webStorage.getItem(AUTH_SESSION_KEY);
    if (Platform.OS === 'web') return null;

    return SecureStore.getItemAsync(AUTH_SESSION_KEY);
  },

  async set(value: string): Promise<void> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.setItem(AUTH_SESSION_KEY, value);
      return;
    }
    if (Platform.OS === 'web') return;

    await SecureStore.setItemAsync(AUTH_SESSION_KEY, value);
  },

  async remove(): Promise<void> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.removeItem(AUTH_SESSION_KEY);
      return;
    }
    if (Platform.OS === 'web') return;

    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
  },
};
