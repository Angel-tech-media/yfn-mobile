import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { InputBar } from '@/components/ui/InputBar';
import { palette, spacing, typography } from '@/src/theme';

const SEGMENTS = 3;
const SEGMENT_DURATION = 4000;

export default function StoryViewer() {
  const [progress] = useState(() => Array.from({ length: SEGMENTS }).map(() => new Animated.Value(0)));
  const segmentRef = useRef(0);

  useEffect(() => {
    const run = (idx: number) => {
      if (idx >= SEGMENTS) {
        router.back();
        return;
      }
      progress[idx].setValue(0);
      Animated.timing(progress[idx], {
        toValue: 1,
        duration: SEGMENT_DURATION,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          segmentRef.current = idx + 1;
          run(idx + 1);
        }
      });
    };
    run(0);
    return () => progress.forEach((p) => p.stopAnimation());
  }, [progress]);

  return (
    <View style={styles.root}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={64} color="rgba(255,255,255,0.30)" />
      </View>

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[StyleSheet.absoluteFill, { bottom: '60%' }]}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={[StyleSheet.absoluteFill, { top: '50%' }]}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          {progress.map((p, i) => (
            <View key={i} style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width: p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.idRow}>
          <Avatar size={32} />
          <Text style={styles.name} numberOfLines={1}>Olusayo Odukoya</Text>
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <View style={styles.spacer} />

        <View style={styles.captionWrap}>
          <Text style={styles.caption}>
            When confidence speaks louder than words. It reveals more than just a portrait…
          </Text>
        </View>

        <View style={styles.replyRow}>
          <View style={{ flex: 1 }}>
            <InputBar showSend={false} placeholder="Send a message…" />
          </View>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Ionicons name="paper-plane-outline" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A1E10',
  },
  safe: { flex: 1, paddingHorizontal: spacing['4'] },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: spacing['2'],
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.30)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
  },
  name: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  spacer: { flex: 1 },
  captionWrap: { paddingBottom: spacing['3'] },
  caption: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  replyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
