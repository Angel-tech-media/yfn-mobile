import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/src/hooks/use-notifications';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function LiveNotificationsScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useNotifications(false);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <Pressable
            hitSlop={8}
            onPress={() => markAll.mutate()}
            disabled={markAll.isPending}
            style={[styles.iconBtn, markAll.isPending && { opacity: 0.5 }]}>
            <Ionicons name="checkmark-done" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.brand.orange} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Couldn't load notifications.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : !data || data.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="notifications-off" size={36} color={palette.ink.onDarkMuted} />
            <Text style={styles.emptyText}>Nothing new.</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(n) => n.id}
            contentContainerStyle={styles.list}
            refreshing={isFetching}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => !item.readAt && markRead.mutate(item.id)}
                style={[styles.row, item.readAt ? styles.rowRead : styles.rowUnread]}>
                <View style={styles.dot}>
                  {!item.readAt ? <View style={styles.dotInner} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title || item.kind}
                  </Text>
                  <Text style={styles.itemBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </EspressoBackground>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  errorText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
  },
  emptyText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
  },
  retryBtn: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  list: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    gap: spacing['2'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  rowRead: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowUnread: {
    backgroundColor: 'rgba(47, 107, 255,0.10)',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.brand.orange,
  },
  itemTitle: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  itemBody: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
    marginTop: 2,
    lineHeight: 18,
  },
  itemTime: {
    ...typography.small,
    color: palette.ink.onDarkMuted,
    marginTop: 4,
  },
});
