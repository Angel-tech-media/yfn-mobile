import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEvent } from 'expo';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeartButton } from '@/components/ui/HeartButton';
import { PlayButton } from '@/components/ui/PlayButton';
import { StoryAuthorInfo } from '@/components/ui/StoryAuthorInfo';
import { useFeedReels } from '@/src/api/feed/hooks';
import { palette, spacing, typography } from '@/src/theme';

export default function ReelScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const { data: reels = [], isError, isLoading, refetch } = useFeedReels({ limit: 30 });
  const reel = id ? reels.find((item) => item.id === id) : reels[0];

  if (isLoading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <TopRow />
          <View style={styles.centerWrap}>
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
        <ReelVideo uri={reel.videoUrl} playing={playing} />
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
          </View>

          <View style={styles.actionRail}>
            <HeartButton liked={liked} onToggle={() => setLiked((value) => !value)} size={32} />
            <RailIcon icon="chatbubble-outline" />
            <RailIcon icon="paper-plane-outline" />
            <RailIcon icon="bookmark-outline" />
            <RailIcon icon="eye-outline" count={formatCompact(reel.views)} />
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

function RailIcon({ icon, count }: { icon: keyof typeof Ionicons.glyphMap; count?: string }) {
  return (
    <Pressable hitSlop={8} style={styles.rail}>
      <Ionicons name={icon} size={30} color="#FFFFFF" style={styles.iconDropShadow} />
      {count ? <Text style={styles.railCount}>{count}</Text> : null}
    </Pressable>
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
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: 'rgba(255,255,255,0.10)',
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
    gap: spacing['3'],
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
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },

  followBtn: {
    paddingHorizontal: spacing['4'],
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  followText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  caption: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
});
