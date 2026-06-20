import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmojiPicker } from '@/components/ui/EmojiPicker';
import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { InputBar } from '@/components/ui/InputBar';
import { useMe } from '@/src/api/account/hooks';
import { useConversation, useMarkConversationRead, useMessages, useSendMessage } from '@/src/api/chat/hooks';
import type { ChatMessage } from '@/src/api/types';
import { useImagePicker } from '@/src/hooks/useImagePicker';
import { palette, radius, spacing, typography } from '@/src/theme';
import { assetUploadErrorMessage, uploadLocalAsset } from '@/src/utils/upload-media';

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id ?? '');
  const { data: me } = useMe();
  const { data: conversation, isError: conversationError, isLoading: conversationLoading, refetch } = useConversation(conversationId);
  const { data: messages = [] } = useMessages(conversationId, { limit: 100 });
  const sendMessage = useSendMessage(conversationId);
  const markRead = useMarkConversationRead();
  const [draft, setDraft] = useState('');
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const otherParticipant = conversation?.participants.find((participant) => participant.userId !== me?.id);
  const { pick } = useImagePicker();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!conversationId) return;
    markRead.mutate(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  const send = () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;
    sendMessage.mutate(
      { kind: 'text', body },
      {
        onSuccess: () => setDraft(''),
      },
    );
  };

  const attachImage = async () => {
    if (sendMessage.isPending || attachmentUploading) return;
    setAttachmentError(null);
    const image = await pick('library', { mediaTypes: ['images'] });
    if (!image) return;

    setAttachmentUploading(true);
    try {
      const uploaded = await uploadLocalAsset(image, 'chat');
      await sendMessage.mutateAsync({
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

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Avatar size={36} initials={otherParticipant?.role === 'vendor' ? 'V' : 'U'} />
          <View style={{ flex: 1 }}>
            <Text style={styles.peerName}>
              {otherParticipant ? (otherParticipant.name || otherParticipant.username || `${capitalize(otherParticipant.role)} ${shortId(otherParticipant.userId)}`) : 'Conversation'}
            </Text>
            <Text style={styles.peerStatus}>{conversation?.productId ? 'Product chat' : 'Messages'}</Text>
          </View>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="call-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        {conversationLoading ? (
          <View style={styles.center}>
            <Text style={styles.stateText}>Loading conversation...</Text>
          </View>
        ) : conversationError || !conversation ? (
          <View style={styles.center}>
            <Text style={styles.stateText}>Could not load conversation.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}>
            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}>
              {messages.length ? (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} mine={message.senderId === me?.id} />
                ))
              ) : (
                <Text style={styles.emptyText}>No messages yet.</Text>
              )}
            </ScrollView>

              <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, spacing['3']) }]}>
              <InputBar
                placeholder="Type a message..."
                value={draft}
                onChangeText={setDraft}
                onAttach={attachImage}
                attachDisabled={attachmentUploading || sendMessage.isPending}
                onSend={send}
                onEmojiClick={() => setShowEmojiPicker(true)}
              />
              {attachmentError ? <Text style={styles.composerError}>{attachmentError}</Text> : null}
            </View>
          </KeyboardAvoidingView>
        )}
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

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const body = message.body ?? (message.kind === 'product_card' ? `Product ${message.productId}` : '');

  return (
    <View style={[styles.bubbleWrap, mine ? styles.bubbleMe : styles.bubbleThem]}>
      {message.kind === 'image' && message.imageUrl ? (
        <View style={[styles.mediaBubble, mine ? styles.bubbleMeStyle : styles.bubbleThemStyle]}>
          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} contentFit="cover" />
        </View>
      ) : null}
      {message.kind === 'product_card' && message.productId ? (
        <Pressable onPress={() => router.push(`/product/${message.productId}` as never)} style={styles.productCard}>
          <Ionicons name="cube-outline" size={20} color={palette.brand.orange} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.productName}>Product</Text>
            <Text style={styles.productPrice}>{message.productId}</Text>
          </View>
        </Pressable>
      ) : null}
      {body && message.kind !== 'product_card' ? (
        <View style={[styles.bubble, mine ? styles.bubbleMeStyle : styles.bubbleThemStyle]}>
          <Text style={[styles.bubbleText, !mine && { color: palette.ink.onDarkStrong }]}>
            {body}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.time, mine ? styles.timeMe : styles.timeThem]}>{timeLabel(message.createdAt)}</Text>
    </View>
  );
}

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shortId(value: string) {
  return value.length > 8 ? value.slice(0, 8) : value;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  stateText: { ...typography.body, color: palette.ink.onDarkSoft },
  retryBtn: {
    height: 36,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  peerName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  peerStatus: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: '#22C55E',
  },
  list: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    gap: spacing['3'],
  },
  emptyText: { ...typography.body, color: palette.ink.onDarkMuted, textAlign: 'center' },
  bubbleWrap: { gap: 4, maxWidth: '78%' },
  bubbleMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: 18,
  },
  mediaBubble: {
    width: 180,
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
  },
  messageImage: { width: '100%', height: '100%' },
  bubbleMeStyle: {
    backgroundColor: palette.brand.orange,
    borderBottomRightRadius: 4,
  },
  bubbleThemStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: '#FFFFFF',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    width: 240,
  },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  productPrice: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.brand.orange,
  },
  time: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    color: palette.ink.onDarkMuted,
  },
  timeMe: { textAlign: 'right' },
  timeThem: { textAlign: 'left' },
  composerWrap: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    gap: spacing['1'],
  },
  composerError: { ...typography.caption, color: palette.status.danger },
});
