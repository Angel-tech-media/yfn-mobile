import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeartButton } from '@/components/ui/HeartButton';
import { PlayButton } from '@/components/ui/PlayButton';
import { StoryAuthorInfo } from '@/components/ui/StoryAuthorInfo';
import { palette, spacing, typography } from '@/src/theme';

export default function ReelScreen() {
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.root}>
      <Image
        source={require('@/assets/figma/reel-snowboarder.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent']}
        style={[StyleSheet.absoluteFill, { bottom: '70%' }]}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.92)']}
        style={[StyleSheet.absoluteFill, { top: '40%' }]}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.centerWrap}>
          <PlayButton playing={playing} onToggle={() => setPlaying((p) => !p)} />
        </View>

        <View style={styles.actionRail}>
          <HeartButton liked={liked} count={20100} onToggle={() => setLiked((l) => !l)} />
          <RailIcon icon="chatbubble-outline" count="3.0K" />
          <RailIcon icon="paper-plane-outline" count="1.5K" />
          <RailIcon icon="bookmark-outline" count="22" />
        </View>

        <View style={styles.bottom}>
          <StoryAuthorInfo
            name="Oludayo Oduk"
            meta="2m ago"
            audioLabel="original sound · odeekay"
            verified
            rightAction={
              <Pressable style={styles.followBtn}>
                <Text style={styles.followText}>Following</Text>
              </Pressable>
            }
          />
          <Text style={styles.caption} numberOfLines={2}>
            When confidence speaks louder than words. It reveals more than just a portrait. It offers a vivid glimpse into the journey.
          </Text>
          <Pressable style={styles.productCTA}>
            <Text style={styles.productLabel}>Product page</Text>
            <Ionicons name="arrow-forward" size={16} color={palette.ink.onLightStrong} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function RailIcon({ icon, count }: { icon: keyof typeof Ionicons.glyphMap; count: string }) {
  return (
    <Pressable hitSlop={8} style={styles.rail}>
      <Ionicons name={icon} size={26} color="#FFFFFF" />
      <Text style={styles.railCount}>{count}</Text>
    </Pressable>
  );
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
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionRail: {
    position: 'absolute',
    right: spacing['4'],
    bottom: 220,
    gap: spacing['4'],
    alignItems: 'center',
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
  bottom: { gap: spacing['3'], paddingBottom: spacing['4'] },
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
  productCTA: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: '#FFFFFF',
  },
  productLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onLightStrong,
  },
});
