import { http } from '@/src/lib/http';

import type { Id, NotificationItem, NotificationsQuery } from '../types';

export const notificationsApi = {
  list(query: NotificationsQuery = {}) {
    return http.get<NotificationItem[]>('/notifications', { query });
  },

  markRead(id: Id) {
    return http.patch<{ read: true }>(`/notifications/${id}/read`);
  },

  markAllRead() {
    return http.patch<{ success: true; count: number }>('/notifications/read-all');
  },

  registerDeviceToken(input: { token: string; platform: 'ios' | 'android' | 'web' }) {
    return http.post<{ success: boolean }>('/notifications/device-token', input);
  },
};
