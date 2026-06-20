import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { HeartButton } from '@/components/ui/HeartButton';
import { PlayButton } from '@/components/ui/PlayButton';
import { VerifiedCheck } from '@/components/ui/VerifiedCheck';
import { useFeedReels } from '@/src/api/feed/hooks';
import type { Reel } from '@/src/api/types';
import { useEngagement, useIsLiked, useIsSaved } from '@/src/store/engagement';
import { palette, spacing, typography } from '@/src/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReelsFeedScreen() {
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<FlatList<Reel>>(null);
  const { data: reels = [], isError, isLoading, refetch } = useFeedReels({ limit: 30 });

  const onMomentum = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(event.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setActiveIdx(idx);
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <TopBar />
          <View style={styles.center}>
            <Text style={styles.stateText}>Loading reels...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <TopBar />
          <View style={styles.center}>
            <Text style={styles.stateText}>Could not load reels.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {reels.length ? (
        <FlatList
          ref={listRef}
          data={reels}
          keyExtractor={(reel) => reel.id}
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMomentum}
          renderItem={({ item, index }) => (
            <ReelCard reel={item} active={index === activeIdx} />
          )}
        />
      ) : (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <TopBar />
          <View style={styles.center}>
            <Text style={styles.stateText}>No reels published yet.</Text>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

function TopBar() {
  return (
    <View style={styles.topRow}>
      <View style={styles.titleRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" style={styles.iconDropShadow} />
        </Pressable>
        <Text style={styles.title}>Reels</Text>
      </View>
      <Pressable onPress={() => router.push('/create/reel' as never)} style={styles.iconBtn} hitSlop={8}>
        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function ReelCard({ reel, active }: { reel: Reel; active: boolean }) {
  const liked = useIsLiked(reel.id);
  const saved = useIsSaved(reel.id);
  const setLike = useEngagement((state) => state.setLike);
  const setSave = useEngagement((state) => state.setSave);
  const [playing, setPlaying] = useState(active);

  useEffect(() => {
    setPlaying(active);
  }, [active]);

  return (
    <Pressable style={[styles.card, { height: SCREEN_HEIGHT }]} onPress={() => active && setPlaying(!playing)}>
      {reel.videoUrl ? (
        <ReelVideo uri={reel.videoUrl} playing={playing} />
      ) : reel.coverUrl ? (
        <Image source={{ uri: reel.coverUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="play-circle-outline" size={56} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.92)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']} pointerEvents="box-none">
        <TopBar />

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
          {!playing && active && <PlayButton playing={playing} onToggle={() => {}} />}
        </View>

        <View style={styles.bottomContainer} pointerEvents="box-none">
          <View style={styles.bottomLeft}>
            <Pressable
              onPress={() => router.push(`/u/${reel.author.handle}` as never)}
              style={styles.authorRow}>
              <Avatar
                size={36}
                source={reel.author.avatarUrl ? { uri: reel.author.avatarUrl } : undefined}
                initials={initialsFor(reel.author.name)}
              />
              <View style={styles.authorBlock}>
                <View style={styles.nameRow}>
                  <Text style={styles.author}>{reel.author.name}</Text>
                  {reel.author.verified ? <VerifiedCheck tone="success" size={13} /> : null}
                </View>
                <Text style={styles.handle}>@{reel.author.handle}</Text>
              </View>
            </Pressable>
            <Text style={styles.caption} numberOfLines={2}>{reel.caption}</Text>
            {reel.audio ? (
              <View style={styles.audioRow}>
                <Ionicons name="musical-notes" size={12} color="#FFFFFF" />
                <Text style={styles.audioText} numberOfLines={1}>{reel.audio}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionRail}>
            <HeartButton liked={liked} onToggle={() => setLike(reel.id, !liked)} size={32} />
            <Pressable
              onPress={() => router.push(`/post/${reel.id}/comments` as never)}
              hitSlop={6}
              style={styles.rail}>
              <Ionicons name="chatbubble-outline" size={30} color="#FFFFFF" style={styles.iconDropShadow} />
            </Pressable>
            <Pressable hitSlop={6} style={styles.rail}>
              <Ionicons name="paper-plane-outline" size={30} color="#FFFFFF" style={styles.iconDropShadow} />
            </Pressable>
            <Pressable onPress={() => setSave(reel.id, !saved)} hitSlop={6} style={styles.rail}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={30}
                color={saved ? palette.brand.orange : '#FFFFFF'}
                style={styles.iconDropShadow}
              />
            </Pressable>
            <View style={styles.rail}>
              <Ionicons name="eye-outline" size={30} color="#FFFFFF" style={styles.iconDropShadow} />
              <Text style={styles.railCount}>{formatCompact(reel.views)}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

function ReelVideo({ uri, playing }: { uri: string; playing: boolean }) {
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
    <>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        surfaceType="textureView"
      />
      {status === 'loading' && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </>
  );
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'Y';
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  card: { width: '100%' },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
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
  coverPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A0B05',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing['2'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: spacing['10'],
    gap: spacing['2'],
  },
  bottomLeft: {
    flex: 1,
    gap: spacing['2'],
    paddingRight: spacing['4'],
  },
  actionRail: {
    gap: spacing['6'],
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
