import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent } from 'expo';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { HeartButton } from '@/components/ui/HeartButton';
import { PlayButton } from '@/components/ui/PlayButton';
import { StoryAuthorInfo } from '@/components/ui/StoryAuthorInfo';
import {
  useCreateReelComment,
  useFeedReels,
  useReelComments,
  useToggleBookmarkReel,
  useToggleLikeReel,
} from '@/src/api/feed/hooks';
import type { Reel } from '@/src/api/types';
import { useEngagement, useIsLiked, useIsSaved } from '@/src/store/engagement';
import { useMe } from '@/src/api/account/hooks';
import { palette, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

export default function ReelScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [playing, setPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);

  const { data: reels = [], isError, isLoading, refetch } = useFeedReels({ limit: 50 });
  const reel = id ? reels.find((item) => item.id === id) : reels[0];

  const storeLiked = useIsLiked(reel?.id ?? '');
  const storeSaved = useIsSaved(reel?.id ?? '');
  const setLike = useEngagement((state) => state.setLike);
  const setSave = useEngagement((state) => state.setSave);

  const toggleLikeMutation = useToggleLikeReel();
  const toggleBookmarkMutation = useToggleBookmarkReel();

  const isLiked = storeLiked !== undefined ? storeLiked : Boolean(reel?.isLiked);
  const isSaved = storeSaved !== undefined ? storeSaved : Boolean(reel?.isSaved);

  const [likesCount, setLikesCount] = useState(reel?.likesCount ?? 0);
  const [bookmarksCount, setBookmarksCount] = useState(reel?.bookmarksCount ?? 0);

  useEffect(() => {
    if (reel) {
      setLikesCount(reel.likesCount ?? Math.floor(reel.views * 0.08));
      setBookmarksCount(reel.bookmarksCount ?? Math.floor(reel.views * 0.02));
    }
  }, [reel]);

  const handleToggleLike = () => {
    if (!reel) return;
    const next = !isLiked;
    setLike(reel.id, next);
    setLikesCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    toggleLikeMutation.mutate({ reelId: reel.id, liked: next });
  };

  const handleToggleBookmark = () => {
    if (!reel) return;
    const next = !isSaved;
    setSave(reel.id, next);
    setBookmarksCount((prev) => Math.max(0, prev + (next ? 1 : -1)));
    toggleBookmarkMutation.mutate({ reelId: reel.id, saved: next });
  };

  const handleShare = async () => {
    if (!reel) return;
    try {
      await Share.share({
        title: reel.caption || 'Watch on YFN',
        message: `${reel.caption ? reel.caption + '\n\n' : ''}Watch & shop on YFN! ${
          reel.product ? '\n🛍️ Product: ' + reel.product.name + ' (' + formatKobo(reel.product.price) + ')' : ''
        }`,
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <TopRow />
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={palette.brand.orange} />
            <Text style={styles.stateText}>Loading reel...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isError || !reel) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <TopRow />
          <View style={styles.centerWrap}>
            <Text style={styles.stateText}>{isError ? 'Could not load reel.' : 'No reel found.'}</Text>
            {isError ? (
              <Pressable onPress={() => refetch()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <Pressable style={styles.root} onPress={() => setPlaying((value) => !value)}>
      {reel.videoUrl ? (
        <ReelVideo uri={reel.videoUrl} playing={playing} coverUrl={reel.coverUrl ?? undefined} />
      ) : reel.coverUrl ? (
        <Image source={{ uri: reel.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="play-circle-outline" size={56} color="rgba(255,255,255,0.5)" />
        </View>
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[StyleSheet.absoluteFill, { bottom: '70%' }]}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.92)']}
        style={[StyleSheet.absoluteFill, { top: '40%' }]}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']} pointerEvents="box-none">
        <TopRow />

        <View style={styles.centerWrap} pointerEvents="none">
          {!playing && <PlayButton playing={playing} onToggle={() => setPlaying((value) => !value)} />}
        </View>

        <View style={styles.bottomContainer} pointerEvents="box-none">
          <View style={styles.bottomLeft}>
            <StoryAuthorInfo
              avatar={reel.author.avatarUrl ? { uri: reel.author.avatarUrl } : undefined}
              name={reel.author.name}
              meta={`@${reel.author.handle}`}
              audioLabel={reel.audio ?? undefined}
              verified={reel.author.verified}
              rightAction={
                <Pressable style={styles.followBtn}>
                  <Text style={styles.followText}>Follow</Text>
                </Pressable>
              }
            />
            <Text style={styles.caption} numberOfLines={2}>
              {reel.caption}
            </Text>

            {reel.product ? (
              <Pressable
                onPress={() => router.push(`/product/${reel.product?.id}` as never)}
                style={styles.productPill}>
                {reel.product.imageUrl ? (
                  <Image source={{ uri: reel.product.imageUrl }} style={styles.productThumb} contentFit="cover" />
                ) : (
                  <View style={styles.productIconWrap}>
                    <Ionicons name="bag-handle" size={14} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.productTextCol}>
                  <Text style={styles.productName} numberOfLines={1}>{reel.product.name}</Text>
                  <Text style={styles.productPrice}>{formatKobo(reel.product.price)}</Text>
                </View>
                <View style={styles.shopBtn}>
                  <Text style={styles.shopBtnText}>Shop Now</Text>
                  <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
                </View>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.actionRail}>
            <View style={styles.rail}>
              <HeartButton liked={isLiked} onToggle={handleToggleLike} size={32} />
              <Text style={styles.railCount}>{formatCompact(likesCount)}</Text>
            </View>

            <Pressable onPress={() => setShowComments(true)} hitSlop={8} style={styles.rail}>
              <Ionicons name="chatbubble-outline" size={30} color="#FFFFFF" style={styles.iconDropShadow} />
              <Text style={styles.railCount}>{formatCompact(reel.commentsCount ?? 3)}</Text>
            </Pressable>

            <Pressable onPress={handleShare} hitSlop={8} style={styles.rail}>
              <Ionicons name="paper-plane-outline" size={30} color="#FFFFFF" style={styles.iconDropShadow} />
              <Text style={styles.railCount}>Share</Text>
            </Pressable>

            <Pressable onPress={handleToggleBookmark} hitSlop={8} style={styles.rail}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={30}
                color={isSaved ? palette.brand.orange : '#FFFFFF'}
                style={styles.iconDropShadow}
              />
              <Text style={styles.railCount}>{formatCompact(bookmarksCount)}</Text>
            </Pressable>

            <View style={styles.rail}>
              <Ionicons name="eye-outline" size={28} color="#FFFFFF" style={styles.iconDropShadow} />
              <Text style={styles.railCount}>{formatCompact(reel.views)}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Interactive Comments Modal Sheet */}
      {showComments && reel ? (
        <ReelCommentsSheet reel={reel} visible={showComments} onClose={() => setShowComments(false)} />
      ) : null}
    </Pressable>
  );
}

function ReelCommentsSheet({
  reel,
  visible,
  onClose,
}: {
  reel: Reel;
  visible: boolean;
  onClose: () => void;
}) {
  const [commentText, setCommentText] = useState('');
  const { data, isLoading, refetch } = useReelComments(reel.id, { limit: 50 });
  const createComment = useCreateReelComment(reel.id);
  const { data: me } = useMe();
  const comments = data?.comments ?? [];

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text || createComment.isPending) return;
    createComment.mutate(
      { body: text },
      {
        onSuccess: () => {
          setCommentText('');
          refetch();
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>
                Comments ({comments.length || reel.commentsCount || 0})
              </Text>
              <Pressable onPress={onClose} hitSlop={10} style={styles.sheetCloseBtn}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.commentsEmpty}>
                  <ActivityIndicator size="small" color={palette.brand.orange} />
                  <Text style={styles.commentsEmptyText}>Loading comments...</Text>
                </View>
              ) : (
                <View style={styles.commentsEmpty}>
                  <Text style={styles.commentsEmptyText}>No comments yet. Be the first to comment!</Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Avatar
                  size={34}
                  source={item.author.avatarUrl ? { uri: item.author.avatarUrl } : undefined}
                  initials={initialsFor(item.author.name)}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentAuthorRow}>
                    <Text style={styles.commentAuthorName}>{item.author.name}</Text>
                    <Text style={styles.commentHandle}>@{item.author.handle}</Text>
                  </View>
                  <Text style={styles.commentBody}>{item.body}</Text>
                </View>
              </View>
            )}
          />

          <View style={styles.sheetComposer}>
            <Avatar
              size={34}
              source={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
              initials={initialsFor(me?.displayName || me?.username || 'Me')}
            />
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <Pressable
              onPress={handleSendComment}
              disabled={!commentText.trim() || createComment.isPending}
              style={[
                styles.sendCommentBtn,
                !commentText.trim() && { opacity: 0.4 },
              ]}>
              {createComment.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ReelVideo({ uri, playing, coverUrl }: { uri: string; playing: boolean; coverUrl?: string }) {
  const player = useVideoPlayer(uri, (nextPlayer) => {
    nextPlayer.loop = true;
    if (playing) nextPlayer.play();
  });

  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (playing) {
      player.play();
    } else {
      player.pause();
    }
  }, [player, playing]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      {status === 'loading' && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

function TopRow() {
  return (
    <View style={styles.topRow}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </Pressable>
      <Pressable onPress={() => router.push('/create/reel' as never)} hitSlop={8} style={styles.iconBtn}>
        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function initialsFor(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'Y'
  );
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  imagePlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A0B05',
  },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing['2'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  stateText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  retryBtn: {
    height: 38,
    paddingHorizontal: spacing['4'],
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: spacing['4'],
    gap: spacing['2'],
  },
  bottomLeft: {
    flex: 1,
    gap: spacing['2'],
    paddingRight: spacing['4'],
  },
  actionRail: {
    gap: spacing['5'],
    alignItems: 'center',
    paddingBottom: spacing['2'],
  },
  iconDropShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  rail: { alignItems: 'center', gap: 2 },
  railCount: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  followText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
  },
  caption: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  productPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    maxWidth: '92%',
  },
  productThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  productIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextCol: {
    flex: 1,
    gap: 1,
  },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
  },
  productPrice: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.brand.amber,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  shopBtnText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
  },

  /* Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    height: 480,
    backgroundColor: '#161210',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  sheetTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: '#FFFFFF',
  },
  sheetCloseBtn: {
    padding: 4,
  },
  commentsListContent: {
    padding: 16,
    gap: 16,
  },
  commentsEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  commentsEmptyText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  commentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
    gap: 2,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthorName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: '#FFFFFF',
  },
  commentHandle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  commentBody: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  sheetComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
