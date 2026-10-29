import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/src/api/notifications/hooks';
import type { NotificationItem } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';

const ICON_BY_KIND: Record<string, { icon: keyof typeof Ionicons.glyphMap; tint: string }> = {
  order: { icon: 'cube', tint: 'rgba(91, 168, 232, 0.20)' },
  follow: { icon: 'person-add', tint: 'rgba(63, 201, 192, 0.20)' },
  like: { icon: 'heart', tint: 'rgba(255, 111, 74, 0.22)' },
  comment: { icon: 'chatbubble', tint: 'rgba(155, 139, 232, 0.22)' },
  sale: { icon: 'pricetag', tint: 'rgba(47, 107, 255, 0.22)' },
  referral: { icon: 'repeat', tint: 'rgba(232, 192, 74, 0.22)' },
  repost: { icon: 'repeat', tint: 'rgba(232, 192, 74, 0.22)' },
  escrow: { icon: 'lock-closed', tint: 'rgba(91, 168, 232, 0.20)' },
  bot: { icon: 'sparkles', tint: 'rgba(155, 139, 232, 0.22)' },
  news: { icon: 'newspaper', tint: 'rgba(63, 201, 192, 0.20)' },
};

const DEFAULT_ICON = { icon: 'notifications' as const, tint: 'rgba(47, 107, 255,0.18)' };

export default function NotificationsScreen() {
  const { data: notifications = [], isError, isLoading, refetch } = useNotifications({ limit: 80 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const open = (notification: NotificationItem) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    const href = hrefFor(notification);
    if (href) router.push(href as never);
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Notifications"
        showBack
        rightAction={
          <Pressable hitSlop={8} onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            <Ionicons name="checkmark-done" size={20} color={palette.brand.orange} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {isLoading ? (
          <Text style={styles.stateText}>Loading notifications...</Text>
        ) : isError ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateText}>Could not load notifications.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : notifications.length ? (
          notifications.map((notification, idx) => (
            <NotificationRow
              key={notification.id ? `notif-${notification.id}-${idx}` : `notif-${idx}`}
              notification={notification}
              onPress={() => open(notification)}
            />
          ))
        ) : (
          <Text style={styles.stateText}>No notifications yet.</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) {
  const meta = ICON_BY_KIND[notification.kind] ?? DEFAULT_ICON;
  const unread = !notification.readAt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.unread,
        pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
        <Ionicons name={meta.icon} size={20} color={palette.ink.onDarkStrong} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.time}>{ageLabel(notification.createdAt)}</Text>
        </View>
        <Text style={styles.bodyText} numberOfLines={2}>{notification.body}</Text>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

function hrefFor(notification: NotificationItem) {
  const { data } = notification;
  if (!data || typeof data !== 'object') return undefined;
  const href = 'href' in data ? (data as { href?: unknown }).href : undefined;
  const path = 'path' in data ? (data as { path?: unknown }).path : undefined;
  const target = href ?? path;
  return typeof target === 'string' ? target : undefined;
}

function ageLabel(value: string) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40, gap: spacing['2'] },
  stateBlock: { gap: spacing['3'], alignItems: 'center', padding: spacing['5'] },
  stateText: {
    ...typography.body,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
    padding: spacing['4'],
  },
  retryBtn: {
    height: 36,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: '#121833',
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.16)',
    alignItems: 'center',
  },
  unread: {
    borderColor: 'rgba(47, 107, 255,0.30)',
    backgroundColor: 'rgba(47, 107, 255,0.06)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleText: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  time: {
    marginLeft: spacing['2'],
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkMuted,
  },
  bodyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.brand.orange,
  },
});
