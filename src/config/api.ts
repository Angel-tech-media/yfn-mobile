import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API base URL. Resolves in this order:
 *   1. `EXPO_PUBLIC_API_URL` env var
 *   2. `extra.apiUrl` in app.json
 *   3. Sensible per-platform localhost defaults for dev
 *
 * In production the env var should be set at build time via `eas.json`.
 */
function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:4000`;
  }

  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  if (fromExtra) return fromExtra.replace(/\/$/, '');

  return 'http://localhost:4000';
}

export const API_BASE_URL = resolveBaseUrl();
export const API_PREFIX = '/api/v1';

export const apiUrl = (path: string): string =>
  `${API_BASE_URL}${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
