import React from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { PressableScale } from '@/components/ui/PressableScale';
import {
  actions,
  getNews,
  getPerson,
  getProduct,
  useApp,
  type Post,
} from '@/src/data/lovable-data';
import { formatNaira, compact } from '@/src/data/lovable-data';
import { useToast } from '@/src/hooks/use-toast';
import { continuous, corner, layout, type, useUi } from '@/src/theme/ui';

export function PostCard({
  post,
  linkToDetail = true,
}: {
  post: Post;
  linkToDetail?: boolean;
}) {
  const ui = useUi();
  const toast = useToast();

  const author = getPerson(post.handle);
  const liked = useApp((s) => s.likedPosts.includes(post.id));
  const saved = useApp((s) => s.savedPosts.includes(post.id));
  const product = post.productId ? getProduct(post.productId) : undefined;
  const article = post.newsId ? getNews(post.newsId) : undefined;

  if (!author) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Aktive post',
        message: `${author.name}: ${post.text}`,
      });
    } catch {
      // User cancelled
    }
  };

  const openProfile = () => router.push(`/u/${author.handle}` as never);
  const openPost = () => {
    if (linkToDetail) {
      router.push(`/post/${post.id}` as never);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: ui.separator }]}>
      {/* Header: Avatar, Name, Verified, @handle · time */}
      <View style={styles.header}>
        <PressableScale haptic="light" scaleTo={0.96} onPress={openProfile} style={styles.authorRow}>
          {author.avatar ? (
            <Image source={author.avatar} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: ui.cardRaised }]}>
              <Text style={[styles.avatarInitials, { color: ui.label }]}>
                {author.name.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: ui.label }]} numberOfLines={1}>
                {author.name}
              </Text>
              {author.verified ? (
                <Ionicons name="checkmark-circle" size={14} color={ui.accent} />
              ) : null}
            </View>
            <Text style={[styles.handleTime, { color: ui.secondaryLabel }]}>
              @{author.handle} · {post.time}
            </Text>
          </View>
        </PressableScale>
      </View>

      {/* Post Text */}
      <PressableScale
        disabled={!linkToDetail}
        onPress={openPost}
        scaleTo={linkToDetail ? 0.995 : 1}
        style={styles.textContainer}>
        <Text style={[styles.postText, { color: ui.label }]}>{post.text}</Text>
      </PressableScale>

      {/* Attached Image */}
      {post.image ? (
        <PressableScale
          disabled={!linkToDetail}
          onPress={openPost}
          scaleTo={linkToDetail ? 0.99 : 1}
          style={[styles.mediaBox, { borderColor: ui.separator, backgroundColor: ui.cardRaised }]}>
          <Image
            source={post.image}
            style={styles.mediaImage}
            contentFit="cover"
            transition={150}
          />
        </PressableScale>
      ) : null}

      {/* Embedded Product Card */}
      {product ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Shop ${product.name}`}
          haptic="medium"
          scaleTo={0.985}
          onPress={() => router.push(`/product/${product.id}` as never)}
          style={[
            styles.productCard,
            {
              backgroundColor: ui.card,
              borderColor: ui.separator,
            },
          ]}>
          <Image
            source={product.image}
            style={[styles.productThumb, { borderColor: ui.separator }]}
            contentFit="cover"
          />
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: ui.label }]} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={[styles.productPrice, { color: ui.label }]}>
              {formatNaira(product.price)}
            </Text>
          </View>
          <View style={[styles.productBagBtn, { backgroundColor: ui.lime }]}>
            <Ionicons name="bag-handle" size={18} color={ui.limeForeground} />
          </View>
        </PressableScale>
      ) : null}

      {/* Embedded News Card */}
      {article ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Read article ${article.title}`}
          haptic="medium"
          scaleTo={0.985}
          onPress={() => router.push(`/news/${article.id}` as never)}
          style={[
            styles.newsCard,
            {
              backgroundColor: ui.card,
              borderColor: ui.separator,
            },
          ]}>
          <Image source={article.image} style={styles.newsImage} contentFit="cover" />
          <View style={styles.newsContent}>
            <View style={styles.newsText}>
              <Text style={[styles.newsMeta, { color: ui.accent }]}>
                {article.category.toUpperCase()} · {article.readMins} MIN READ
              </Text>
              <Text style={[styles.newsTitle, { color: ui.label }]} numberOfLines={2}>
                {article.title}
              </Text>
            </View>
            <Ionicons name="arrow-up" size={16} color={ui.secondaryLabel} style={{ transform: [{ rotate: '45deg' }] }} />
          </View>
        </PressableScale>
      ) : null}

      {/* Footer Actions */}
      <View style={styles.footer}>
        {/* Like */}
        <PressableScale
          haptic="selection"
          scaleTo={0.88}
          hitSlop={6}
          onPress={() => actions.toggleLike(post.id)}
          style={styles.actionBtn}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? ui.coral : ui.secondaryLabel}
          />
          <Text
            style={[
              styles.actionCount,
              { color: liked ? ui.coral : ui.secondaryLabel },
            ]}>
            {compact(post.likes + (liked ? 1 : 0))}
          </Text>
        </PressableScale>

        {/* Comment */}
        <PressableScale
          haptic="light"
          scaleTo={0.88}
          hitSlop={6}
          onPress={() => router.push(`/post/${post.id}` as never)}
          style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={ui.secondaryLabel} />
          <Text style={[styles.actionCount, { color: ui.secondaryLabel }]}>
            {compact(post.comments)}
          </Text>
        </PressableScale>

        {/* Repost */}
        <PressableScale
          haptic="light"
          scaleTo={0.88}
          hitSlop={6}
          onPress={() => toast.show({ variant: 'success', title: 'Reposted to your followers' })}
          style={styles.actionBtn}>
          <Ionicons name="repeat-outline" size={20} color={ui.secondaryLabel} />
          <Text style={[styles.actionCount, { color: ui.secondaryLabel }]}>
            {compact(post.reposts)}
          </Text>
        </PressableScale>

        <View style={{ flex: 1 }} />

        {/* Share */}
        <PressableScale
          haptic="light"
          scaleTo={0.88}
          hitSlop={6}
          onPress={handleShare}
          style={styles.actionBtn}>
          <Ionicons name="paper-plane-outline" size={18} color={ui.secondaryLabel} />
        </PressableScale>

        {/* Save */}
        <PressableScale
          haptic="selection"
          scaleTo={0.88}
          hitSlop={6}
          onPress={() => {
            actions.toggleSave(post.id);
            toast.show({
              variant: 'success',
              title: saved ? 'Removed from saved' : 'Saved for later',
            });
          }}
          style={styles.actionBtn}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={19}
            color={saved ? ui.accent : ui.secondaryLabel}
          />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 16,
  },
  authorInfo: {
    flex: 1,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  handleTime: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 12,
  },
  textContainer: {
    marginTop: 12,
  },
  postText: {
    fontFamily: 'InstrumentSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  mediaBox: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...continuous,
  },
  mediaImage: {
    width: '100%',
    height: 280,
  },
  productCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...continuous,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
  },
  productPrice: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
  },
  productBagBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  newsCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...continuous,
  },
  newsImage: {
    width: '100%',
    height: 144,
  },
  newsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  },
  newsText: {
    flex: 1,
    gap: 4,
  },
  newsMeta: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  actionCount: {
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
