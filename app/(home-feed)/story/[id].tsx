import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSourcePropType } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { palette, spacing, typography } from '@/src/theme';

const STORY_IMAGES = [
  require('@/assets/figma/story-1.png'),
  require('@/assets/figma/story-2.png'),
  require('@/assets/figma/story-3.png'),
  require('@/assets/figma/story-4.png'),
  require('@/assets/figma/story-5.png'),
  require('@/assets/figma/story-6.png'),
];

type StorySlide = {
  image: ImageSourcePropType;
  caption?: string;
  duration?: number; // ms
};

type StoryData = {
  handle: string;
  name: string;
  age: string;
  avatar: ImageSourcePropType;
  slides: StorySlide[];
};

const STORIES: Record<string, StoryData> = {
  s1: {
    handle: 'olufemia',
    name: 'Olufemi',
    age: '2h',
    avatar: STORY_IMAGES[0],
    slides: [
      { image: STORY_IMAGES[0], caption: 'Rooftop golden hour 🌅' },
      { image: STORY_IMAGES[1], caption: 'New camera test shots' },
      { image: STORY_IMAGES[2] },
    ],
  },
  s2: {
    handle: 'adaeze',
    name: 'Adaeze',
    age: '3h',
    avatar: STORY_IMAGES[1],
    slides: [
      { image: STORY_IMAGES[1], caption: 'Friday market run · so much pepper' },
      { image: STORY_IMAGES[3] },
    ],
  },
  s3: {
    handle: 'midemoji',
    name: 'Mide',
    age: '4h',
    avatar: STORY_IMAGES[2],
    slides: [
      { image: STORY_IMAGES[2], caption: 'Behind the scenes of the shoot' },
      { image: STORY_IMAGES[4], caption: 'wrapped 🎬' },
    ],
  },
  s4: {
    handle: 'doyinojo',
    name: 'Doyin',
    age: '5h',
    avatar: STORY_IMAGES[3],
    slides: [{ image: STORY_IMAGES[3], caption: 'Saturday slots open — DM' }],
  },
  s5: {
    handle: 'tolathreads',
    name: 'Tola',
    age: '6h',
    avatar: STORY_IMAGES[4],
    slides: [
      { image: STORY_IMAGES[4], caption: 'Jersey restock unboxing' },
      { image: STORY_IMAGES[5] },
    ],
  },
  s6: {
    handle: 'bisia',
    name: 'Bisi',
    age: '7h',
    avatar: STORY_IMAGES[5],
    slides: [{ image: STORY_IMAGES[5], caption: 'New book club pick this month' }],
  },
};

function makeFallbackStory(id: string): StoryData {
  /** Use the id string to deterministically pick a photo from the pool. */
  const hash = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const img = STORY_IMAGES[hash % STORY_IMAGES.length];
  // Pretty-format the handle: "olufemia" → "Olufemi A.", "naijakitchen" → "Naija Kitchen"
  const name = id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  return {
    handle: id,
    name: name || 'Vibe user',
    age: 'now',
    avatar: img,
    slides: [{ image: img, caption: `@${id}` }],
  };
}

const SLIDE_DURATION = 5000;
const { width: SW } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = STORIES[String(id)] ?? makeFallbackStory(String(id ?? 'unknown'));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const slide = story.slides[index];

  useEffect(() => {
    progress.setValue(0);
    if (paused) return;
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: slide?.duration ?? SLIDE_DURATION,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (!finished) return;
      if (index < story.slides.length - 1) {
        setIndex(index + 1);
      } else {
        router.back();
      }
    });
    return () => anim.stop();
  }, [index, paused, progress, slide, story.slides.length]);

  const advance = () => {
    if (index < story.slides.length - 1) setIndex(index + 1);
    else router.back();
  };
  const back = () => {
    if (index > 0) setIndex(index - 1);
    else router.back();
  };

  return (
    <View style={styles.root}>
      <Image source={slide.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.55)', 'transparent', 'transparent', 'rgba(0, 0, 0, 0.65)']}
        locations={[0, 0.18, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Tap zones */}
      <Pressable
        style={styles.tapLeft}
        onPress={back}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      />
      <Pressable
        style={styles.tapRight}
        onPress={advance}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      />

      <SafeAreaView edges={['top']} style={styles.topBar}>
        {/* Progress segments */}
        <View style={styles.segments}>
          {story.slides.map((_, i) => (
            <View key={i} style={styles.segmentTrack}>
              <Animated.View
                style={[
                  styles.segmentFill,
                  i < index && { width: '100%' },
                  i === index && {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.push(`/u/${story.handle}` as never)}
            style={styles.authorRow}
            hitSlop={6}>
            <Avatar size={32} source={story.avatar} />
            <Text style={styles.author}>{story.name}</Text>
            <Text style={styles.age}>{story.age}</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="Pause/play">
            <Ionicons
              name={paused ? 'play' : 'volume-mute'}
              size={16}
              color="#fff"
            />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="More">
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.iconBtn}
            accessibilityLabel="Close">
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {slide.caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>{slide.caption}</Text>
        </View>
      ) : null}

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.composer}>
          <TextInput
            placeholder={`Reply to ${story.name}…`}
            placeholderTextColor="rgba(255,255,255,0.65)"
            style={styles.composerInput}
          />
          <View style={styles.reactionsRow}>
            {['❤️', '🔥', '😂', '👏', '🙌', '😮'].map((r) => (
              <Pressable key={r} hitSlop={6} style={styles.reactionBtn}>
                <Text style={styles.reactionGlyph}>{r}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable hitSlop={8} style={styles.iconBtn} accessibilityLabel="DM">
          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
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
    gap: 6,
  },
  composerInput: {
    color: '#fff',
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    paddingVertical: 4,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  reactionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionGlyph: { fontSize: 18 },
});
