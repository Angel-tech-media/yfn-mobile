import { useEffect, useState } from 'react';

import * as Location from 'expo-location';

const LAGOS_FALLBACK = { lat: 6.5244, lng: 3.3792 };

export interface DeviceLocation {
  lat: number;
  lng: number;
  /** True when expo-location resolved; false means we're using LAGOS_FALLBACK. */
  resolved: boolean;
  permission: 'granted' | 'denied' | 'undetermined' | 'pending';
}

/**
 * Wraps expo-location with a Yaba/Lagos fallback so screens always get a
 * usable coordinate even before the user grants permission.
 *
 * For the demo we ask once and cache forever. A real app would re-ask after
 * settings changes and respect background-permission limits.
 */
export function useDeviceLocation(): DeviceLocation {
  const [location, setLocation] = useState<DeviceLocation>({
    ...LAGOS_FALLBACK,
    resolved: false,
    permission: 'pending',
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setLocation((prev) => ({ ...prev, permission: status, resolved: false }));
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          resolved: true,
          permission: 'granted',
        });
      } catch {
        if (cancelled) return;
        setLocation((prev) => ({ ...prev, permission: 'granted', resolved: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
