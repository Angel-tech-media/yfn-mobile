import { useState } from 'react';
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Badge } from '@/components/kit/Chip';
import { Card } from '@/components/kit/Card';
import { ProductQuickViewModal } from '@/components/product/ProductQuickViewModal';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ImageViewerModal } from '@/components/ui/ImageViewerModal';
import { PostRepostSheet } from '@/components/ui/PostRepostSheet';
import { PressableScale } from '@/components/ui/PressableScale';
import { useMe } from '@/src/api/account/hooks';
import { useDeletePost, useToggleBookmarkPost, useToggleLikePost } from '@/src/api/feed/hooks';
import { useToast } from '@/src/hooks/use-toast';
import { vibeHaptics } from '@/src/lib/haptics';
import { useEngagement, useIsLiked, useIsRepostedPost, useIsSaved } from '@/src/store/engagement';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

export type PostItem = {
  id: string;
  author: string;
  authorHandle: string;
  authorAvatarUrl?: string | null;
  verified: boolean;
  caption: string;
  product: string;
  productId?: string;
  price: string;
  likes: number;
  comments: number;
  reposts: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  repostedByMe?: boolean;
  imageUrls: string[];
};

function initialsFor(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'A'
  );
}

function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function PostCard({ post }: { post: PostItem }) {
  const ui = useUi();
  const toast = useToast();
  const { data: me } = useMe();

  const localLike = useIsLiked(post.id);
  const localSave = useIsSaved(post.id);
  const localRepost = useIsRepostedPost(post.id);
  const liked = localLike !== undefined ? localLike : !!post.likedByMe;
  const saved = localSave !== undefined ? localSave : !!post.savedByMe;
  const reposted = localRepost !== undefined ? localRepost : !!post.repostedByMe;

  const setLike = useEngagement((s) => s.setLike);
  const setSave = useEngagement((s) => s.setSave);

  const likeMutation = useToggleLikePost();
  const bookmarkMutation = useToggleBookmarkPost();
  const deleteMutation = useDeletePost();

  const [repostOpen, setRepostOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const isMine = me?.handle === post.authorHandle;
  const shoppable = !!post.product;
  const likeCount = post.likes + (liked && !post.likedByMe ? 1 : !liked && post.likedByMe ? -1 : 0);
  const repostCount = post.reposts + (reposted && !post.repostedByMe ? 1 : !reposted && post.repostedByMe ? -1 : 0);

  const toggleLike = () => {
    setLike(post.id, !liked);
    likeMutation.mutate({ postId: post.id, isLiked: liked });
  };

  const toggleSave = () => {
    const next = !saved;
    setSave(post.id, next);
    bookmarkMutation.mutate({ postId: post.id, isSaved: saved });
    toast.show({ variant: 'success', title: next ? 'Saved' : 'Removed from saved' });
  };

  const share = async () => {
    try {
      await Share.share({
        title: 'Share post',
        message: `${post.author}: ${post.caption} https://aktive.app/post/${post.id}`,
        url: `https://aktive.app/post/${post.id}`,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'User did not share') {
        console.log('Error sharing:', error);
      }
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete post', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setOptionsOpen(false);
          deleteMutation.mutate(post.id, {
            onSuccess: () => toast.show({ variant: 'success', title: 'Post deleted' }),
            onError: () => toast.show({ variant: 'error', title: 'Couldn’t delete post' }),
          });
        },
      },
    ]);
  };

  const openProfile = () => router.push(`/u/${post.authorHandle}` as never);

  return (
    <Card elevated style={styles.card}>
      {/* Author */}
      <View style={styles.authorRow}>
        <PressableScale haptic="light" scaleTo={0.97} onPress={openProfile} style={styles.authorTap}>
          <Avatar
            size={38}
            source={post.authorAvatarUrl ? { uri: post.authorAvatarUrl } : undefined}
            initials={initialsFor(post.author)}
          />
          <View style={styles.authorText}>
            <View style={styles.nameRow}>
              <Text style={[type.subhead, styles.name, { color: ui.label }]} numberOfLines={1}>
                {post.author}
              </Text>
              {post.verified ? <Ionicons name="checkmark-circle" size={14} color={ui.accent} /> : null}
            </View>
            <Text style={[type.footnote, { color: ui.secondaryLabel }]} numberOfLines={1}>
              @{post.authorHandle}
            </Text>
          </View>
        </PressableScale>
        <PressableScale
          accessibilityLabel="More options"
          haptic="light"
          hitSlop={10}
          onPress={() => setOptionsOpen(true)}
          style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={ui.secondaryLabel} />
        </PressableScale>
      </View>

      {/* Media */}
      {post.imageUrls.length ? (
        <Media
          imageUrls={post.imageUrls}
          price={shoppable ? post.price : undefined}
          onLongPress={shoppable ? () => { vibeHaptics.heavy(); setQuickViewOpen(true); } : undefined}
        />
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <Action
          icon={liked ? 'heart' : 'heart-outline'}
          color={liked ? ui.coral : ui.label}
          count={likeCount}
          label={liked ? 'Unlike' : 'Like'}
          haptic="selection"
          onPress={toggleLike}
        />
        <Action
          icon="chatbubble-outline"
          color={ui.label}
          count={post.comments}
          label="Comments"
          onPress={() => router.push(`/post/${post.id}/comments` as never)}
        />
        <Action
          icon="repeat"
          color={reposted ? ui.accent : ui.label}
          count={repostCount}
          label="Repost"
          onPress={() => setRepostOpen(true)}
        />
        <Action icon="paper-plane-outline" color={ui.label} label="Share" onPress={share} />
        <View style={{ flex: 1 }} />
        <Action
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          color={saved ? ui.accent : ui.label}
          label={saved ? 'Remove from saved' : 'Save'}
          haptic="selection"
          onPress={toggleSave}
        />
      </View>

      {/* Caption */}
      {post.caption ? (
        <PressableScale
          scaleTo={0.99}
          onPress={() => router.push(`/post/${post.id}` as never)}
          style={styles.caption}>
          <Text style={[type.subhead, styles.captionText, { color: ui.label }]} numberOfLines={3}>
            <Text style={styles.captionAuthor}>{post.author}  </Text>
            <Text style={{ color: ui.label, opacity: 0.9 }}>{post.caption}</Text>
          </Text>
        </PressableScale>
      ) : null}

      {/* Lovable Inset Product Commerce Card */}
      {shoppable ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Shop ${post.product}`}
          haptic="medium"
          scaleTo={0.985}
          onPress={() => {
            if (post.productId) {
              router.push(`/product/${post.productId}` as never);
            } else {
              router.push(`/place/${post.authorHandle}` as never);
            }
          }}
          style={[
            styles.shop,
            {
              backgroundColor: ui.cardRaised,
              borderColor: ui.separator,
            },
          ]}>
          {post.imageUrls[0] ? (
            <Image
              source={{ uri: post.imageUrls[0] }}
              style={[styles.shopThumb, { borderColor: ui.separator }]}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.shopIconBox, { backgroundColor: ui.card, borderColor: ui.separator }]}>
              <Ionicons name="bag-handle" size={17} color={ui.accent} />
            </View>
          )}
          <View style={styles.shopText}>
            <Text style={[type.subhead, styles.shopTitle, { color: ui.label }]} numberOfLines={1}>
              {post.product}
            </Text>
            <Text style={[styles.shopPriceText, { color: ui.gold }]}>
              {post.price}
            </Text>
          </View>
          <View style={[styles.shopCtaRound, { backgroundColor: ui.lime }]}>
            <Ionicons name="bag-handle-outline" size={16} color={ui.limeForeground} />
          </View>
        </PressableScale>
      ) : null}

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
            <SheetRow
              icon="pencil-outline"
              label="Edit post"
              onPress={() => {
                setOptionsOpen(false);
                router.push({
                  pathname: '/post/[id]/edit',
                  params: { id: post.id, initialCaption: post.caption },
                } as never);
              }}
            />
            <SheetRow icon="trash-outline" label="Delete post" destructive onPress={confirmDelete} />
          </>
        ) : (
          <SheetRow icon="flag-outline" label="Report post" onPress={() => setOptionsOpen(false)} />
        )}
      </BottomSheet>

      {shoppable ? (
        <ProductQuickViewModal
          visible={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          product={{
            id: post.productId ?? post.id,
            title: post.product,
            price: Math.round((parseFloat(post.price.replace(/[^0-9.]/g, '')) || 0) * 100),
            imageUrl: post.imageUrls?.[0],
            vendorHandle: post.authorHandle,
            vendorName: post.author,
            description: post.caption,
          }}
        />
      ) : null}
    </Card>
  );
}

function Action({
  icon,
  color,
  count,
  label,
  haptic = 'light',
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count?: number;
  label: string;
  haptic?: 'light' | 'selection';
  onPress: () => void;
}) {
  const ui = useUi();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      haptic={haptic}
      scaleTo={0.88}
      hitSlop={6}
      onPress={onPress}
      style={styles.action}>
      <Ionicons name={icon} size={22} color={color} />
      {count !== undefined && count > 0 ? (
        <Text style={[type.footnote, styles.actionCount, { color: ui.secondaryLabel }]}>{compact(count)}</Text>
      ) : null}
    </PressableScale>
  );
}

function SheetRow({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const ui = useUi();
  const color = destructive ? ui.danger : ui.label;
  return (
    <PressableScale haptic="light" scaleTo={0.98} onPress={onPress} style={styles.sheetRow}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[type.body, { color }]}>{label}</Text>
    </PressableScale>
  );
}

function Media({
  imageUrls,
  price,
  onLongPress,
}: {
  imageUrls: string[];
  price?: string;
  onLongPress?: () => void;
}) {
  const ui = useUi();
  const { width } = useWindowDimensions();
  const inset = 10;
  const mediaWidth = width - layout.gutter * 2 - inset * 2;
  const mediaHeight = Math.round(mediaWidth * 1.12);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const multiple = imageUrls.length > 1;

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / mediaWidth);
    setIndex(Math.min(Math.max(next, 0), imageUrls.length - 1));
  };

  return (
    <>
      <View
        style={[
          styles.media,
          {
            width: mediaWidth,
            height: mediaHeight,
            borderColor: ui.separator,
          },
        ]}>
        <ScrollView
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onEnd}>
          {imageUrls.map((url, i) => (
            <PressableScale
              key={`${url}-${i}`}
              scaleTo={1}
              delayLongPress={280}
              onLongPress={onLongPress}
              onPress={() => setViewer(true)}>
              <Image
                source={{ uri: url }}
                style={{ width: mediaWidth, height: mediaHeight, backgroundColor: ui.cardRaised }}
                contentFit="cover"
                transition={150}
              />
            </PressableScale>
          ))}
        </ScrollView>

        {price ? (
          <View style={styles.priceOverlay} pointerEvents="none">
            <Badge tone="price" icon="pricetag" label={price} />
          </View>
        ) : null}

        {multiple ? (
          <View style={styles.dots} pointerEvents="none">
            {imageUrls.map((url, i) => (
              <View
                key={`${url}-dot-${i}`}
                style={[styles.dot, { backgroundColor: i === index ? '#F5F2EC' : 'rgba(245,242,236,0.40)' }]}
              />
            ))}
          </View>
        ) : null}
      </View>
      <ImageViewerModal
        visible={viewer}
        onClose={() => setViewer(false)}
        imageUrls={imageUrls}
        initialIndex={index}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.gutter,
    padding: 0,
    borderRadius: 24,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  authorTap: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  authorText: { flexShrink: 1, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontFamily: 'InstrumentSans_600SemiBold', letterSpacing: -0.3, flexShrink: 1 },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  priceOverlay: { position: 'absolute', left: 12, bottom: 12 },
  dots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 13, 12, 0.55)',
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontFamily: 'InstrumentSans_600SemiBold', fontVariant: ['tabular-nums'] },
  caption: { paddingHorizontal: 14, paddingBottom: 12 },
  captionText: { lineHeight: 20 },
  captionAuthor: { fontFamily: 'InstrumentSans_600SemiBold', letterSpacing: -0.2 },
  shop: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...continuous,
  },
  shopThumb: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  shopIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    ...continuous,
  },
  shopText: { flex: 1, gap: 2 },
  shopTitle: { fontFamily: 'InstrumentSans_600SemiBold', letterSpacing: -0.2 },
  shopPriceText: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  shopCtaRound: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 20 },
});
