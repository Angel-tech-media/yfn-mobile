import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { useStoriesInbox } from '@/src/api/feed/hooks';
import { palette, spacing, typography } from '@/src/theme';

const SLIDE_DURATION = 5000;
const { width: SW } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: stories = [], isError, isLoading, refetch } = useStoriesInbox();
  const story = stories.find((item) => item.id === id);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!story || paused) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) router.back();
    });
    return () => anim.stop();
  }, [paused, progress, story?.id]);

  if (isLoading) {
    return <StateView label="Loading story..." />;
  }

  if (isError) {
    return <StateView label="Could not load story." onRetry={() => refetch()} />;
  }

  if (!story) {
    return <StateView label="Story not found." />;
  }

  return (
    <View style={styles.root}>
      <Image source={{ uri: story.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.55)', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.65)']}
        locations={[0, 0.18, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        style={styles.tapLeft}
        onPress={() => router.back()}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      />
      <Pressable
        style={styles.tapRight}
        onPress={() => router.back()}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      />

      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={styles.segments}>
          <View style={styles.segmentTrack}>
            <Animated.View
              style={[
                styles.segmentFill,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.push(`/u/${story.author.handle}` as never)}
            style={styles.authorRow}
            hitSlop={6}>
            <Avatar
              size={32}
              source={story.author.avatarUrl ? { uri: story.author.avatarUrl } : undefined}
              initials={initialsFor(story.author.name)}
            />
            <Text style={styles.author}>{story.author.name}</Text>
            <Text style={styles.age}>{ageLabel(story.createdAt)}</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => setPaused((value) => !value)}
            hitSlop={8}
            style={styles.iconBtn}
            accessibilityLabel="Pause/play">
            <Ionicons name={paused ? 'play' : 'pause'} size={16} color="#fff" />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Close">
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {story.caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>{story.caption}</Text>
        </View>
      ) : null}

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.composer}>
          <TextInput
            placeholder={`Reply to ${story.author.name}...`}
            placeholderTextColor="rgba(255,255,255,0.65)"
            style={styles.composerInput}
          />
        </View>
        <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="DM">
          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function StateView({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.stateHeader}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="close" size={18} color="#fff" />
        </Pressable>
      </SafeAreaView>
      <View style={styles.stateCenter}>
        <Text style={styles.stateText}>{label}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
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
  root: { flex: 1, backgroundColor: '#000' },
  stateHeader: { alignItems: 'flex-end', paddingHorizontal: spacing['3'], paddingTop: 6 },
  stateCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  stateText: { ...typography.body, color: '#fff' },
  retryBtn: {
    height: 36,
    borderRadius: 999,
    paddingHorizontal: spacing['4'],
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  retryText: { ...typography.bodyEmphasis, color: '#fff' },
  tapLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SW * 0.35,
  },
  tapRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: SW * 0.65,
  },
  topBar: {
    paddingHorizontal: spacing['3'],
    paddingTop: 6,
  },
  segments: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  segmentTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  segmentFill: { height: '100%', backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing['2'],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  author: {
    ...typography.bodyEmphasis,
    color: '#fff',
    fontSize: 14,
  },
  age: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionWrap: {
    position: 'absolute',
    bottom: 130,
    left: spacing['4'],
    right: spacing['4'],
  },
  caption: {
    ...typography.title,
    fontSize: 17,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing['3'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
  },
  composer: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: spacing['3'],
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  composerInput: {
    color: '#fff',
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    paddingVertical: 4,
  },
});
