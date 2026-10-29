import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

import { notificationsApi } from '@/src/api/notifications';
import { useAuth } from '@/src/store/auth';

// Ensure notifications show alerts, sound, and badge while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const tokenRegisteredRef = useRef<string | null>(null);

  useEffect(() => {
    // Push notifications are supported natively on iOS and Android
    if (Platform.OS === 'web') return;

    // 1. Android Notification Channel setup
    if (Platform.OS === 'android') {
      void Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2F6BFF',
        enableLights: true,
        enableVibrate: true,
      });
    }

    // 2. Request permissions & register token when authenticated
    async function registerToken() {
      if (!user?.id) return;

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          return;
        }

        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;

        const tokenResult = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        const pushToken = tokenResult.data;

        if (pushToken && tokenRegisteredRef.current !== pushToken) {
          await notificationsApi.registerDeviceToken({
            token: pushToken,
            platform: Platform.OS as 'ios' | 'android',
          });
          tokenRegisteredRef.current = pushToken;
        }
      } catch (err) {
        // In local Expo Go or simulator where remote push is not supported, catch gracefully
        if (__DEV__) {
          console.log('[PushNotifications] Device token registration info:', err);
        }
      }
    }

    void registerToken();

    // 3. Handle notification response / taps (Deep linking)
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response?.notification?.request?.content?.data as Record<string, any> | undefined;
      if (!data) return;

      if (typeof data.url === 'string' && data.url.length > 0) {
        router.push(data.url as any);
      } else if (data.conversationId) {
        router.push(`/threads/${data.conversationId}` as any);
      } else if (data.orderId) {
        router.push(`/orders/${data.orderId}` as any);
      }
    };

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // 4. Handle initial cold-start notification click
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, [user?.id, router]);
}
