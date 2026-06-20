import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmojiPicker } from '@/components/ui/EmojiPicker';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { InputBar } from '@/components/ui/InputBar';
import {
  useConversation,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '@/src/hooks/use-chat';
import { useChatSocket } from '@/src/hooks/use-chat-socket';
import { useAuth } from '@/src/store/auth';
import { useImagePicker } from '@/src/hooks/useImagePicker';
import { assetUploadErrorMessage, uploadLocalAsset } from '@/src/utils/upload-media';
import { palette, spacing, typography } from '@/src/theme';

export default function ThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id);
  const me = useAuth((s) => s.user?.id);

  const { data: conversation } = useConversation(conversationId);
  const { data: messages, isLoading, isError } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();
  useChatSocket(conversationId);
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const insets = useSafeAreaInsets();
  const { pick } = useImagePicker();

  useEffect(() => {
    if (conversationId) markRead.mutate(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!messages?.length) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages?.length]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    send.mutate({ kind: 'text', body: text });
    setDraft('');
  };

  const attachImage = async () => {
    if (send.isPending || attachmentUploading) return;
    setAttachmentError(null);
    const image = await pick('library', { mediaTypes: ['images'] });
    if (!image) return;

    setAttachmentUploading(true);
    try {
      const uploaded = await uploadLocalAsset(image, 'chat');
      await send.mutateAsync({
        kind: 'image',
        imageUrl: uploaded.publicUrl,
        mediaId: uploaded.mediaId,
      });
    } catch (err) {
      setAttachmentError(assetUploadErrorMessage(err));
    } finally {
      setAttachmentUploading(false);
    }
  };

  const otherParticipant = conversation?.participants?.find((p) => p.userId !== me);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {otherParticipant?.name || otherParticipant?.username || 'Thread'}
          </Text>
          <View style={styles.iconBtn} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={palette.brand.orange} />
            </View>
          ) : isError ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>Couldn't load this thread.</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}>
              {(messages ?? []).map((m) => {
                const mine = me ? m.senderId === me : false;
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.bubbleWrap,
                      mine ? styles.bubbleMe : styles.bubbleThem,
                    ]}>
                    {m.kind === 'product_card' ? (
                      <View style={styles.productCard}>
                        <Ionicons name="bag" size={18} color={palette.brand.orange} />
                        <Text style={styles.productText} numberOfLines={1}>
                          Product · {m.productId?.slice(0, 8) ?? 'unknown'}
                        </Text>
                      </View>
                    ) : m.kind === 'image' && m.imageUrl ? (
                      <View style={[styles.mediaBubble, mine ? styles.bubbleMeStyle : styles.bubbleThemStyle]}>
                        <Image source={{ uri: m.imageUrl }} style={styles.messageImage} contentFit="cover" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.bubble,
                          mine ? styles.bubbleMeStyle : styles.bubbleThemStyle,
                        ]}>
                        <Text
                          style={[
                            styles.bubbleText,
                            !mine && { color: palette.ink.onDarkStrong },
                          ]}>
                          {m.body}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.time, mine ? styles.timeMe : styles.timeThem]}>
                      {formatTime(m.createdAt)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, spacing['3']) }]}>
            <InputBar
              placeholder="Type a message…"
              value={draft}
              onChangeText={setDraft}
              onAttach={attachImage}
              attachDisabled={attachmentUploading || send.isPending}
              onSend={submit}
              onEmojiClick={() => setShowEmojiPicker(true)}
            />
            {attachmentError ? <Text style={styles.composerError}>{attachmentError}</Text> : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelected={(emoji) => setDraft((d) => d + emoji)}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </EspressoBackground>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  list: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    gap: spacing['3'],
  },
  bubbleWrap: { gap: 4, maxWidth: '78%' },
  bubbleMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: 18,
  },
  bubbleMeStyle: {
    backgroundColor: palette.brand.orange,
    borderBottomRightRadius: 4,
  },
  bubbleThemStyle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...typography.body,
    color: '#fff',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: 14,
    backgroundColor: 'rgba(216, 149, 68,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.4)',
  },
  productText: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  mediaBubble: {
    width: 180,
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
  },
  messageImage: { width: '100%', height: '100%' },
  time: {
    ...typography.small,
  },
  timeMe: { color: palette.ink.onDarkMuted, alignSelf: 'flex-end' },
  timeThem: { color: palette.ink.onDarkMuted, alignSelf: 'flex-start' },
  composerWrap: {
    paddingHorizontal: spacing['3'],
    paddingBottom: spacing['3'],
  },
  composerError: { ...typography.caption, color: palette.status.danger },
});
