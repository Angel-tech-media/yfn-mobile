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
import { continuous, useUi } from '@/src/theme/ui';

const ICON_BY_KIND: Record<string, keyof typeof Ionicons.glyphMap> = {
  order: 'cube-outline',
  follow: 'person-add-outline',
  like: 'heart-outline',
  comment: 'chatbubble-outline',
  sale: 'pricetag-outline',
  referral: 'repeat',
  repost: 'repeat',
  escrow: 'lock-closed-outline',
  bot: 'sparkles-outline',
  news: 'newspaper-outline',
};

export default function NotificationsScreen() {
  const ui = useUi();
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
          <Pressable
            hitSlop={8}
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            style={[styles.markBtn, { backgroundColor: ui.secondary }]}>
            <Ionicons name="checkmark-done" size={16} color={ui.accent} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {isLoading ? (
          <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>
            Loading notifications...
          </Text>
        ) : isError ? (
          <View style={styles.stateBlock}>
            <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>
              Could not load notifications.
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryBtn, { backgroundColor: ui.accent }]}>
              <Text style={[styles.retryText, { color: ui.onAccent }]}>Retry</Text>
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
          <View style={styles.stateBlock}>
            <View style={[styles.emptyIconBox, { backgroundColor: ui.secondary }]}>
              <Ionicons name="notifications-outline" size={28} color={ui.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: ui.label }]}>All caught up</Text>
            <Text style={[styles.stateText, { color: ui.secondaryLabel }]}>
              New likes, escrow updates, and drops will appear here.
            </Text>
          </View>
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
  const ui = useUi();
  const icon = ICON_BY_KIND[notification.kind] ?? 'notifications-outline';
  const unread = !notification.readAt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: ui.card,
          borderColor: unread ? ui.accent : ui.separator,
        },
        pressed && { opacity: 0.85 },
      ]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: unread ? ui.lime : ui.secondary },
        ]}>
        <Ionicons
          name={icon}
          size={19}
          color={unread ? ui.limeForeground : ui.label}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.titleText, { color: ui.label }]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={[styles.time, { color: ui.secondaryLabel }]}>
            {ageLabel(notification.createdAt)}
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: ui.secondaryLabel }]} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>
      {unread ? <View style={[styles.dot, { backgroundColor: ui.coral }]} /> : null}
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
  markBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 40,
    gap: 8,
  },
  stateBlock: {
    gap: 8,
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...continuous,
  },
  emptyTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
  },
  stateText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    height: 38,
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 13,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    ...continuous,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...continuous,
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleText: {
    flex: 1,
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    lineHeight: 19,
  },
  time: {
    marginLeft: 8,
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 11,
  },
  bodyText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
