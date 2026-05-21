import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsBackend, type NotificationItem } from '@/src/api/backend';

const POLL_MS = 60_000;

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', unreadOnly ? 'unread' : 'all'],
    queryFn: () => notificationsBackend.list(unreadOnly),
    refetchInterval: POLL_MS,
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications(true);
  return data?.length ?? 0;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsBackend.markRead(id),
    onSuccess: (_, id) => {
      const now = new Date().toISOString();
      const patch = (list?: NotificationItem[]) =>
        list?.map((n) => (n.id === id ? { ...n, readAt: now } : n));
      qc.setQueryData<NotificationItem[]>(['notifications', 'all'], patch);
      qc.setQueryData<NotificationItem[]>(['notifications', 'unread'], (list) =>
        list?.filter((n) => n.id !== id),
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsBackend.markAllRead(),
    onSuccess: () => {
      const now = new Date().toISOString();
      qc.setQueryData<NotificationItem[]>(['notifications', 'all'], (list) =>
        list?.map((n) => (n.readAt ? n : { ...n, readAt: now })),
      );
      qc.setQueryData<NotificationItem[]>(['notifications', 'unread'], []);
    },
  });
}
