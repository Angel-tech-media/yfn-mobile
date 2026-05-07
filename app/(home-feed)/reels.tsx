import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ImageSourcePropType,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { HeartButton } from '@/components/ui/HeartButton';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useEngagement, useIsLiked, useIsSaved } from '@/src/store/engagement';
import { palette, spacing, typography } from '@/src/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const REELS_DATA: Array<{
  id: string;
  author: string;
  handle: string;
  avatar: ImageSourcePropType;
  caption: string;
  audio: string;
  background: ImageSourcePropType;
  likes: number;
  comments: string;
}> = [
  {
    id: 'r1',
    author: 'Oludayo Oduk',
    handle: 'odeekay',
    avatar: require('@/assets/figma/store-avatar.png'),
    caption: 'When confidence speaks louder than words. It reveals more than just a portrait.',
    audio: 'original sound · odeekay',
    background: require('@/assets/figma/reel-snowboarder.png'),
    likes: 20100,
    comments: '3.0K',
  },
  {
    id: 'r2',
    author: "Sarah's Boutique",
    handle: 'sarahsboutique',
    avatar: require('@/assets/figma/story-1.png'),
    caption: 'New Ankara collection drops Friday. Tap to shop the look 🛍️',
    audio: 'original sound · sarahsboutique',
    background: require('@/assets/figma/product-sample.png'),
    likes: 8420,
    comments: '512',
  },
  {
    id: 'r3',
    author: 'Janet Ogborini',
    handle: 'janetogb',
    avatar: require('@/assets/figma/story-2.png'),
    caption: 'Behind the scenes from this week’s shoot.',
    audio: 'sunset glow · alt-j',
    background: require('@/assets/figma/welcome-hero.png'),
    likes: 14200,
    comments: '780',
  },
];

export default function ReelsFeedScreen() {
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setActiveIdx(idx);
  };

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={REELS_DATA}
        keyExtractor={(r) => r.id}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentum}
        renderItem={({ item, index }) => <ReelCard reel={item} active={index === activeIdx} />}
      />
    </View>
  );
}

function ReelCard({ reel, active }: { reel: typeof REELS_DATA[number]; active: boolean }) {
  const liked = useIsLiked(reel.id);
  const saved = useIsSaved(reel.id);
  const toggleLike = useEngagement((s) => s.toggleLike);
  const toggleSave = useEngagement((s) => s.toggleSave);

  return (
    <View style={[styles.card, { height: SCREEN_HEIGHT }]}>
      <Image source={reel.background} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.92)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Reels</Text>
          <Pressable onPress={() => router.push('/create/reel' as never)} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.actionRail}>
          <HeartButton liked={liked} count={reel.likes + (liked ? 1 : 0)} onToggle={() => toggleLike(reel.id)} size={28} />
          <Pressable
            onPress={() => router.push(`/post/${reel.id}/comments` as never)}
            hitSlop={6}
            style={styles.rail}>
            <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
            <Text style={styles.railCount}>{reel.comments}</Text>
          </Pressable>
          <Pressable hitSlop={6} style={styles.rail}>
            <Ionicons name="paper-plane-outline" size={26} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => toggleSave(reel.id)} hitSlop={6} style={styles.rail}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={saved ? palette.brand.orange : '#FFFFFF'}
            />
          </Pressable>
        </View>

        <View style={styles.bottom}>
          <Pressable
            onPress={() => router.push(`/u/${reel.handle}` as never)}
            style={styles.authorRow}>
            <Avatar size={36} source={reel.avatar} />
            <View style={styles.authorBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.author}>{reel.author}</Text>
                <VerifiedCheck tone="success" size={13} />
              </View>
              <Text style={styles.handle}>@{reel.handle}</Text>
            </View>
          </Pressable>
          <Text style={styles.caption} numberOfLines={2}>{reel.caption}</Text>
          <View style={styles.audioRow}>
            <Ionicons name="musical-notes" size={12} color="#FFFFFF" />
            <Text style={styles.audioText} numberOfLines={1}>{reel.audio}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  card: { width: '100%' },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing['2'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 22,
    color: '#FFFFFF',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  actionRail: {
    position: 'absolute',
    right: spacing['3'],
    bottom: 200,
    gap: spacing['4'],
    alignItems: 'center',
  },
  rail: { alignItems: 'center', gap: 2 },
  railCount: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  bottom: { gap: spacing['2'], paddingBottom: spacing['10'] },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  authorBlock: { gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  author: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  handle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  caption: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    maxWidth: '80%',
  },
  audioText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
