import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { ImageViewerModal } from '@/components/ui/ImageViewerModal';
import { PostRepostSheet } from '@/components/ui/PostRepostSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';

import { useMe } from '@/src/api/account/hooks';
import {
  useDeletePost,
  usePost,
  useToggleBookmarkPost,
  useToggleLikePost,
} from '@/src/api/feed/hooks';
import { useToast } from '@/src/hooks/use-toast';
import {
  useEngagement,
  useIsLiked,
  useIsRepostedPost,
  useIsSaved,
} from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';
import { formatKobo } from '@/src/utils/money';

import type { Post } from '@/src/api/types';

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
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

export default function SinglePostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading, isError, refetch } = usePost(id);

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onLightStrong} />
          </Pressable>
          <Text style={styles.title}>Post</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={palette.brand.orange} />
            </View>
          ) : isError || !post ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>Could not load post.</Text>
              <Pressable onPress={() => refetch()}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ paddingHorizontal: spacing['4'], paddingTop: spacing['2'] }}>
              <SinglePostCard rawPost={post} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function SinglePostCard({ rawPost }: { rawPost: Post }) {
  const post = {
    id: rawPost.id,
    author: rawPost.author.name,
    authorHandle: rawPost.author.handle,
    authorAvatarUrl: rawPost.author.avatarUrl,
    badge: !!rawPost.author.verified,
    caption: rawPost.caption,
    product: rawPost.product?.name ?? '',
    productId: rawPost.product?.id,
    price: rawPost.product ? formatKobo(rawPost.product.price) : '',
    likes: rawPost.likes,
    comments: rawPost.comments,
    reposts: rawPost.reposts ?? 0,
    likedByMe: rawPost.likedByMe,
    savedByMe: rawPost.savedByMe,
    repostedByMe: rawPost.repostedByMe,
    imageUrls: rawPost.imageUrls,
  };

  const localLike = useIsLiked(post.id);
  const localSave = useIsSaved(post.id);
  const liked = localLike !== undefined ? localLike : !!post.likedByMe;
  const saved = localSave !== undefined ? localSave : !!post.savedByMe;
  const localRepost = useIsRepostedPost(post.id);
  const reposted = localRepost !== undefined ? localRepost : !!post.repostedByMe;
  
  const setLike = useEngagement((s) => s.setLike);
  const setSave = useEngagement((s) => s.setSave);
  const setRepostedPost = useEngagement((s) => s.setRepostedPost);
  
  const [repostOpen, setRepostOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const toast = useToast();
  const likeMutation = useToggleLikePost();
  const bookmarkMutation = useToggleBookmarkPost();
  const deleteMutation = useDeletePost();
  const { data: me } = useMe();
  const isMine = me?.handle === post.authorHandle;

  const handleToggleLike = () => {
    const nextLiked = !liked;
    setLike(post.id, nextLiked);
    likeMutation.mutate({ postId: post.id, isLiked: liked });
  };

  const handleToggleSave = () => {
    const nextSaved = !saved;
    setSave(post.id, nextSaved);
    bookmarkMutation.mutate({ postId: post.id, isSaved: saved });
    toast.show({ variant: 'success', title: nextSaved ? 'Post bookmarked' : 'Bookmark removed' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Share Post',
        message: `${post.author} posted: ${post.caption} - https://aktive.app/post/${post.id}`,
        url: `https://aktive.app/post/${post.id}`,
      });
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setOptionsOpen(false);
          deleteMutation.mutate(post.id, {
            onSuccess: () => {
              toast.show({ variant: 'success', title: 'Post deleted' });
              router.back();
            },
            onError: () => {
              toast.show({ variant: 'error', title: 'Failed to delete post' });
            },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.cardWrap}>
      <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Pressable onPress={() => router.push(`/u/${post.authorHandle}` as never)}>
            <Avatar
              size={36}
              source={post.authorAvatarUrl ? { uri: post.authorAvatarUrl } : undefined}
              initials={initialsFor(post.author)}
            />
          </Pressable>
          <Pressable style={styles.idBlock} onPress={() => router.push(`/u/${post.authorHandle}` as never)}>
            <View style={styles.nameRow}>
              <Text style={styles.author}>{post.author}</Text>
              {post.badge ? <VerifiedCheck tone="success" size={14} /> : null}
            </View>
          </Pressable>
          <Pressable hitSlop={8} onPress={() => setOptionsOpen(true)}>
            <Ionicons name="ellipsis-horizontal" size={18} color={palette.ink.onDarkSoft} />
          </Pressable>
        </View>

        <Text style={styles.caption}>{post.caption}</Text>

        {post.imageUrls.length ? (
          <PostCarousel imageUrls={post.imageUrls} />
        ) : (
          <View style={styles.heroImagePlaceholder}>
            <Ionicons name="image-outline" size={28} color={palette.ink.onDarkMuted} />
          </View>
        )}

        <View style={styles.engagementRow}>
          <Pressable onPress={handleToggleLike} hitSlop={6} style={styles.engageBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? '#FF3B47' : palette.ink.onDarkStrong}
            />
            <Text style={styles.engageCount}>
              {formatCompact(post.likes + (liked && !rawPost.likedByMe ? 1 : (!liked && rawPost.likedByMe ? -1 : 0)))}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/post/${post.id}/comments` as never)} hitSlop={6} style={styles.engageBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={palette.ink.onDarkStrong} />
            <Text style={styles.engageCount}>{formatCompact(post.comments)}</Text>
          </Pressable>
          <Pressable onPress={() => setRepostOpen(true)} hitSlop={6} style={styles.engageBtn}>
            <Ionicons
              name="repeat"
              size={22}
              color={reposted ? palette.brand.orange : palette.ink.onDarkStrong}
            />
            <Text style={styles.engageCount}>
              {formatCompact(post.reposts + (reposted && !rawPost.repostedByMe ? 1 : (!reposted && rawPost.repostedByMe ? -1 : 0)))}
            </Text>
          </Pressable>
          <Pressable hitSlop={6} style={styles.engageBtn} onPress={handleShare}>
            <Ionicons name="paper-plane-outline" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={handleToggleSave} hitSlop={6}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? palette.brand.orange : palette.ink.onDarkStrong}
            />
          </Pressable>
        </View>

        <PostRepostSheet
          visible={repostOpen}
          onClose={() => setRepostOpen(false)}
          post={{
            id: post.id,
            author: post.author,
            authorHandle: post.authorHandle,
            repostedByMe: reposted,
            caption: post.caption,
          }}
        />

        <BottomSheet visible={optionsOpen} onClose={() => setOptionsOpen(false)}>
          {isMine ? (
            <>
              <Pressable
                onPress={() => {
                  setOptionsOpen(false);
                  router.push({
                    pathname: `/post/[id]/edit`,
                    params: { id: post.id, initialCaption: post.caption },
                  } as never);
                }}
                style={styles.optionsActionRow}>
                <Ionicons name="pencil-outline" size={20} color={palette.ink.onDarkStrong} />
                <Text style={styles.optionsActionText}>Edit post</Text>
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.optionsActionRow}>
                <Ionicons name="trash-outline" size={20} color="#FF3B47" />
                <Text style={[styles.optionsActionText, { color: '#FF3B47' }]}>Delete post</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setOptionsOpen(false)} style={styles.optionsActionRow}>
              <Ionicons name="flag-outline" size={20} color={palette.ink.onDarkStrong} />
              <Text style={styles.optionsActionText}>Report post</Text>
            </Pressable>
          )}
        </BottomSheet>

        {post.product ? (
          <View style={styles.cardFooter}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {post.product}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{post.price}</Text>
              </View>
            </View>
            <PrimaryButton
              label="Buy now"
              onPress={() => router.push(`/product/${post.productId ?? post.id}` as never)}
              style={styles.buyBtn}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PostCarousel({ imageUrls }: { imageUrls: string[] }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const mediaWidth = Math.max(width - spacing['5'] * 2 - spacing['3'] * 2, 240);
  const hasMultiple = imageUrls.length > 1;

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / mediaWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), imageUrls.length - 1));
  };

  return (
    <>
      <View style={[styles.carouselFrame, { width: mediaWidth }]}>
        <ScrollView
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}>
          {imageUrls.map((url, index) => (
            <Pressable key={`${url}-${index}`} onPress={() => setViewerVisible(true)}>
              <Image
                source={{ uri: url }}
                style={[styles.carouselImage, { width: mediaWidth }]}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </ScrollView>

        {hasMultiple ? (
          <>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeIndex + 1}/{imageUrls.length}
              </Text>
            </View>
            <View style={styles.carouselDots}>
              {imageUrls.map((url, index) => (
                <View
                  key={`${url}-dot-${index}`}
                  style={[styles.carouselDot, index === activeIndex && styles.carouselDotActive]}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>
      <ImageViewerModal
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        imageUrls={imageUrls}
        initialIndex={activeIndex}
      />
    </>
  );
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
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyEmphasis,
    fontSize: 16,
    color: palette.ink.onLightStrong,
  },
  scroll: {
    paddingBottom: 40,
  },
  center: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    ...typography.body,
    color: palette.ink.onLightStrong,
  },
  retryText: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
  },
  cardWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.50)',
    backgroundColor: 'rgba(32, 32, 39, 0.86)',
  },
  card: {
    padding: spacing['3'],
    gap: spacing['3'],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  idBlock: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  author: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  caption: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkSoft,
  },
  carouselFrame: {
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  carouselImage: {
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  heroImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
  },
  imageCounterText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  carouselDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
  },
  carouselDotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    paddingTop: spacing['1'],
  },
  engageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  engageCount: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkSoft,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  productInfo: { flex: 1 },
  productName: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['2'],
    marginTop: 2,
  },
  price: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: palette.brand.orangeDeep,
  },
  buyBtn: {
    paddingHorizontal: spacing['4'],
    height: 32,
    borderRadius: radius.md,
  },
  optionsActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['5'],
  },
  optionsActionText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
});
