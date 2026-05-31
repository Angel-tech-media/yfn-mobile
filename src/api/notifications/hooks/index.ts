import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '..';
import { queryKeys } from '../../query-keys';

import type { NotificationItem, NotificationsQuery } from '../../types';

const POLL_MS = 60_000;

export function useNotifications(params: NotificationsQuery | boolean = {}) {
  const query = typeof params === 'boolean' ? { unread: params ? ('true' as const) : undefined } : params;
  return useQuery({
    queryKey: queryKeys.notifications.list(query),
    queryFn: () => notificationsApi.list(query),
    refetchInterval: POLL_MS,
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications({ unread: 'true' });
  return data?.length ?? 0;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: (_, id) => {
      const now = new Date().toISOString();
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: ['notifications'] },
        (list) => list?.map((n) => (n.id === id ? { ...n, readAt: now } : n)),
      );
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: ['notifications', { unread: 'true' }] },
        (list) => list?.filter((n) => n.id !== id),
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      const now = new Date().toISOString();
      qc.setQueriesData<NotificationItem[]>(
        { queryKey: ['notifications'] },
        (list) => list?.map((n) => (n.readAt ? n : { ...n, readAt: now })),
      );
    },
  });
}

export const useRegisterDeviceToken = () =>
  useMutation({ mutationFn: notificationsApi.registerDeviceToken });
