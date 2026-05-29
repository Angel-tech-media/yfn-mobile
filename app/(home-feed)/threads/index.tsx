import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useConversations } from '@/src/hooks/use-chat';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function ThreadsListScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useConversations();

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.title}>Chats</Text>
          <View style={styles.iconBtn} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={palette.brand.orange} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Couldn't reach the chat service. Is the backend running?
            </Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : !data || data.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={48}
              color={palette.ink.onDarkMuted}
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Message a vendor from a product page to start one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            refreshing={isFetching}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/threads/${item.id}` as never)}
                style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name="storefront" size={18} color={palette.ink.onLightStrong} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.peerName} numberOfLines={1}>
                    {item.participants
                      .map((p) => `${p.role === 'vendor' ? '🛍️' : '🛒'} ${p.userId.slice(0, 8)}`)
                      .join(' · ')}
                  </Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.lastMessagePreview ?? 'No messages yet'}
                  </Text>
                </View>
                <Text style={styles.time}>{formatTime(item.updatedAt)}</Text>
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
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    paddingHorizontal: spacing['6'],
    gap: spacing['3'],
  },
  errorText: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
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
  emptyTitle: {
    ...typography.title,
    color: palette.ink.onDarkStrong,
  },
  emptySubtitle: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    gap: spacing['2'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  preview: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  time: {
    ...typography.small,
    color: palette.ink.onDarkMuted,
  },
});
