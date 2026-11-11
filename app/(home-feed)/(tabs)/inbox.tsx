import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { NewMessageModal } from '@/components/ui/NewMessageModal';
import { useConversations } from '@/src/api/chat/hooks';
import { useAuth } from '@/src/store/auth';
import { continuous, layout, useUi } from '@/src/theme/ui';

export default function InboxScreen() {
  const ui = useUi();
  const me = useAuth((s) => s.user?.id);
  const { data: threads = [], isLoading, isError, refetch, isFetching } = useConversations();
  const [newMsgOpen, setNewMsgOpen] = useState(false);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={[styles.circleBtn, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Ionicons name="chevron-back" size={20} color={ui.label} />
            </Pressable>
            <Text style={[styles.title, { color: ui.label }]}>Messages</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setNewMsgOpen(true)}
            style={[styles.circleBtn, { backgroundColor: ui.lime, borderColor: ui.lime }]}>
            <Ionicons name="create-outline" size={19} color={ui.limeForeground} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={ui.accent} />
              <Text style={[styles.emptyText, { color: ui.secondaryLabel }]}>
                Loading conversations…
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: ui.secondaryLabel }]}>
                Couldn&apos;t load conversations.
              </Text>
              <Pressable onPress={() => refetch()} disabled={isFetching}>
                <Text style={[styles.retryText, { color: ui.coral }]}>
                  {isFetching ? 'Retrying…' : 'Try again'}
                </Text>
              </Pressable>
            </View>
          ) : threads.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIconBox, { backgroundColor: ui.secondary }]}>
                <Ionicons name="chatbubbles-outline" size={28} color={ui.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: ui.label }]}>No messages yet</Text>
              <Text style={[styles.emptyText, { color: ui.secondaryLabel }]}>
                Message any seller or buyer directly about a drop or order.
              </Text>
            </View>
          ) : (
            Array.from(new Map((threads ?? []).map((t) => [t.id, t])).values()).map((t, idx) => {
              const peer = t.participants?.find((p) => p.userId !== me);
              const peerName =
                peer?.name || peer?.username || `Conversation ${t.id.slice(0, 8)}`;
              const initials = peerName.charAt(0).toUpperCase() || 'A';

              return (
                <Pressable
                  key={t.id ? 'thread-' + t.id : 'thread-idx-' + idx}
                  onPress={() => router.push(`/threads/${t.id}` as never)}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: ui.card, borderColor: ui.separator },
                    pressed && { opacity: 0.85 },
                  ]}>
                  <Avatar
                    size={46}
                    source={peer?.avatarUrl ? { uri: peer.avatarUrl } : undefined}
                    initials={initials}
                  />
                  <View style={styles.body}>
                    <Text style={[styles.name, { color: ui.label }]} numberOfLines={1}>
                      {t.orderId
                        ? `Order #${t.orderId.slice(0, 8)}`
                        : t.productId
                        ? `Product inquiry`
                        : peerName}
                    </Text>
                    <Text style={[styles.preview, { color: ui.secondaryLabel }]} numberOfLines={1}>
                      {t.lastMessagePreview ?? 'No messages yet'}
                    </Text>
                  </View>
                  <View style={styles.meta}>
                    <Text style={[styles.time, { color: ui.secondaryLabel }]}>
                      {formatWhen(t.updatedAt)}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
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
    paddingHorizontal: layout.gutter,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  list: {
    paddingHorizontal: layout.gutter,
    paddingBottom: 100,
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: 8,
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
  emptyText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: 'InstrumentSans_700Bold',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  body: { flex: 1, gap: 2 },
  name: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 15,
  },
  preview: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 13,
  },
  meta: { alignItems: 'flex-end', gap: 4 },
  time: {
    fontFamily: 'InstrumentSans_500Medium',
    fontSize: 11,
  },
});
