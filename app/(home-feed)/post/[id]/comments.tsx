import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useMe } from '@/src/api/account/hooks';
import { useCreateComment, usePostComments } from '@/src/api/feed/hooks';
import type { Comment, FeedAuthor } from '@/src/api/types';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [composer, setComposer] = useState('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const { data, isError, isLoading, refetch } = usePostComments(id, { limit: 80 });
  const createComment = useCreateComment(id);
  const { data: me } = useMe();
  const comments = data?.comments ?? [];

  const toggleLike = (commentId: string) =>
    setLikedIds((state) => ({ ...state, [commentId]: !state[commentId] }));

  const post = () => {
    const body = composer.trim();
    if (!body || createComment.isPending) return;
    createComment.mutate(
      { body },
      {
        onSuccess: () => setComposer(''),
      },
    );
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={22} color={palette.ink.onLightStrong} />
          </Pressable>
          <Text style={styles.title}>Comments</Text>
          <Pressable hitSlop={8} accessibilityLabel="Share">
            <Ionicons name="paper-plane-outline" size={20} color={palette.ink.onLightStrong} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            <Text style={styles.counter}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Text>

            {isLoading ? (
              <Text style={styles.stateText}>Loading comments...</Text>
            ) : isError ? (
              <View style={styles.stateBlock}>
                <Text style={styles.stateTitle}>Comments unavailable</Text>
                <Text style={styles.stateText}>The backend could not load comments.</Text>
                <Pressable onPress={() => refetch()} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : comments.length ? (
              comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  liked={Boolean(likedIds[comment.id])}
                  onLike={() => toggleLike(comment.id)}
                />
              ))
            ) : (
              <Text style={styles.stateText}>No comments yet.</Text>
            )}
          </ScrollView>

          <View style={styles.composer}>
            <ComposerAvatar
              name={me?.displayName ?? me?.username ?? 'Me'}
              imageUrl={me?.avatarUrl ?? undefined}
            />
            <TextInput
              value={composer}
              onChangeText={setComposer}
              placeholder="Add a comment..."
              placeholderTextColor={palette.ink.onLightSubtle}
              style={styles.composerInput}
              multiline
            />
            <Pressable
              onPress={post}
              hitSlop={6}
              disabled={!composer.trim() || createComment.isPending}
              style={[
                styles.postBtn,
                !composer.trim() || createComment.isPending ? { opacity: 0.4 } : null,
              ]}>
              <Text style={styles.postLabel}>{createComment.isPending ? 'Posting' : 'Post'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function CommentRow({
  comment,
  liked,
  onLike,
}: {
  comment: Comment;
  liked: boolean;
  onLike: () => void;
}) {
  const likes = comment.likes + (liked ? 1 : 0);

  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push(`/u/${comment.author.handle}` as never)}>
        <AuthorAvatar author={comment.author} />
      </Pressable>
      <View style={styles.bubbleWrap}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.push(`/u/${comment.author.handle}` as never)}>
            <Text style={styles.author}>{comment.author.name}</Text>
          </Pressable>
          {comment.author.verified ? (
            <View style={styles.verifyDot}>
              <Ionicons name="shield-checkmark" size={9} color="#fff" />
            </View>
          ) : null}
          <Text style={styles.time}>· {ageLabel(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.body}</Text>
        <View style={styles.actionsRow}>
          <Pressable hitSlop={6} onPress={onLike}>
            <Text style={styles.actionText}>{liked ? 'Liked' : 'Like'}</Text>
          </Pressable>
          <Text style={styles.actionDot}>·</Text>
          <Pressable hitSlop={6}>
            <Text style={styles.actionText}>Reply</Text>
          </Pressable>
          {likes > 0 ? (
            <>
              <Text style={styles.actionDot}>·</Text>
              <Text style={styles.actionLikes}>
                {likes} {likes === 1 ? 'like' : 'likes'}
              </Text>
            </>
          ) : null}
        </View>
      </View>
      <Pressable hitSlop={6} onPress={onLike}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={14}
          color={liked ? palette.status.danger : palette.ink.onLightSubtle}
        />
      </Pressable>
    </View>
  );
}

function AuthorAvatar({ author }: { author: FeedAuthor }) {
  if (author.avatarUrl) {
    return <Image source={{ uri: author.avatarUrl }} style={styles.avatar} contentFit="cover" />;
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{initialFor(author.name)}</Text>
    </View>
  );
}

function ComposerAvatar({ imageUrl, name }: { imageUrl?: string; name: string }) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={styles.composerAvatar} contentFit="cover" />;
  }
  return (
    <View style={styles.composerAvatarFallback}>
      <Text style={styles.avatarInitial}>{initialFor(name)}</Text>
    </View>
  );
}

function initialFor(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'Y';
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
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.bodyEmphasis, fontSize: 15, color: palette.ink.onLightStrong },
  list: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['8'],
  },
  counter: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginBottom: spacing['3'],
  },
  stateBlock: { gap: spacing['2'], paddingVertical: spacing['2'] },
  stateTitle: { ...typography.bodyEmphasis, color: palette.ink.onLightStrong },
  stateText: { ...typography.body, color: palette.ink.onLightSubtle },
  retryBtn: {
    alignSelf: 'flex-start',
    height: 34,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    alignItems: 'flex-start',
  },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
  avatarInitial: { ...typography.caption, color: '#fff', fontFamily: typography.bodyEmphasis.fontFamily },
  bubbleWrap: { flex: 1, gap: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  author: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.ink.onLightStrong,
  },
  verifyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { ...typography.caption, color: palette.ink.onLightSubtle },
  text: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onLightStrong,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  actionText: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  actionLikes: { ...typography.caption, color: palette.ink.onLightSubtle },
  actionDot: { ...typography.caption, color: palette.ink.onLightSubtle },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  composerAvatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 4 },
  composerAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing['3'],
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: palette.ink.onLightStrong,
    ...typography.body,
    fontSize: 14,
  },
  postBtn: { paddingHorizontal: spacing['2'], paddingVertical: 12 },
  postLabel: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
    fontSize: 14,
  },
});
