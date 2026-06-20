import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { NewMessageModal } from '@/components/ui/NewMessageModal';
import { useAuth } from '@/src/store/auth';
import { useConversations } from '@/src/api/chat/hooks';
import { palette, spacing, typography } from '@/src/theme';

export default function InboxScreen() {
  const me = useAuth((s) => s.user?.id);
  const { data: threads = [], isLoading, isError, refetch, isFetching } = useConversations();
  const [newMsgOpen, setNewMsgOpen] = useState(false);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable hitSlop={8} onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={palette.ink.onDarkStrong} />
            </Pressable>
            <Text style={styles.title}>Inbox</Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setNewMsgOpen(true)} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={palette.brand.orange} />
              <Text style={styles.emptyText}>Loading conversations…</Text>
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Couldn&apos;t load conversations.</Text>
              <Pressable onPress={() => refetch()} disabled={isFetching}>
                <Text style={styles.retryText}>{isFetching ? 'Retrying…' : 'Try again'}</Text>
              </Pressable>
            </View>
          ) : threads.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={32} color={palette.ink.onDarkMuted} />
              <Text style={styles.emptyText}>No conversations yet.</Text>
            </View>
          ) : threads.map((t) => {
            const peer = t.participants?.find((p) => p.userId !== me);
            const peerName = peer?.name || peer?.username || `Conversation ${t.id.slice(0, 8)}`;
            const initials = peerName.charAt(0).toUpperCase() || 'C';

            return (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/threads/${t.id}` as never)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
                <Avatar size={48} source={peer?.avatarUrl ? { uri: peer.avatarUrl } : undefined} initials={initials} />
                <View style={styles.body}>
                  <Text style={styles.name}>
                    {t.orderId ? `Order ${t.orderId}` : t.productId ? `Product ${t.productId}` : peerName}
                  </Text>
                  <Text style={styles.preview} numberOfLines={1}>{t.lastMessagePreview ?? 'No messages yet'}</Text>
                </View>
              <View style={styles.meta}>
                <Text style={styles.time}>{formatWhen(t.updatedAt)}</Text>
              </View>
            </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <NewMessageModal visible={newMsgOpen} onClose={() => setNewMsgOpen(false)} />
    </EspressoBackground>
  );
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-NG', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
  },
  list: {
    paddingHorizontal: spacing['5'],
    paddingBottom: 100,
  },
  empty: { alignItems: 'center', paddingVertical: spacing['8'], gap: spacing['2'] },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  retryText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.brand.orange,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
  },
  body: { flex: 1, gap: 2 },
  name: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  preview: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
  },
  meta: { alignItems: 'flex-end', gap: 6 },
  time: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkMuted,
  },
  unreadBubble: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
  },
});
