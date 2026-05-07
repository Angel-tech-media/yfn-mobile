import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { useEngagement, useIsFollowing } from '@/src/store/engagement';
import { palette, radius, spacing, typography } from '@/src/theme';

const PRODUCT_IMAGE = require('@/assets/figma/product-sample.png');
const STORY_AVATARS = [
  require('@/assets/figma/story-1.png'),
  require('@/assets/figma/story-2.png'),
  require('@/assets/figma/story-3.png'),
];

const TABS = ['Posts', 'Reels', 'Tagged'] as const;

export default function PublicProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const userKey = String(handle ?? 'user');
  const isFollowing = useIsFollowing(userKey);
  const toggleFollow = useEngagement((s) => s.toggleFollow);

  // Pick avatar by hash of handle
  const idx = (userKey.charCodeAt(0) ?? 0) % STORY_AVATARS.length;

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
          <Text style={styles.handleHeader}>@{userKey}</Text>
          <Pressable hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.idCard}>
            <Avatar size={88} source={STORY_AVATARS[idx]} />
            <Text style={styles.name}>{toTitle(userKey)}</Text>
            <Text style={styles.bio}>Documenting my style journey · Lagos · DM for collabs</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat value="247" label="Posts" />
            <Stat value="12.5K" label="Followers" />
            <Stat value="318" label="Following" />
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => toggleFollow(userKey)}
              style={({ pressed }) => [
                styles.followBtn,
                isFollowing ? styles.followingBtn : styles.notFollowing,
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={[styles.followLabel, isFollowing && styles.followingLabel]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.msgBtn, pressed && { opacity: 0.85 }]}>
              <Text style={styles.msgLabel}>Message</Text>
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            {TABS.map((t, i) => (
              <Pressable key={t} style={styles.tab}>
                <Text style={[styles.tabLabel, i === 0 && styles.tabActive]}>{t}</Text>
                {i === 0 ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            ))}
          </View>

          <View style={styles.grid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i} style={styles.tile}>
                <Image source={PRODUCT_IMAGE} style={styles.tileImage} contentFit="cover" />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function toTitle(s: string) {
  return s.replace(/-/g, ' ').replace(/(^|\s)\w/g, (m) => m.toUpperCase());
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
  },
  handleHeader: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: palette.ink.onDarkStrong,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: 100 },
  idCard: { alignItems: 'center', gap: spacing['2'], paddingVertical: spacing['4'], paddingHorizontal: spacing['5'] },
  name: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: palette.ink.onDarkStrong,
    marginTop: spacing['2'],
  },
  bio: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing['4'],
    marginHorizontal: spacing['5'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  stat: { alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    color: palette.ink.onDarkStrong,
  },
  statLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    color: palette.ink.onDarkMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['2'],
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['4'],
  },
  followBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFollowing: {
    backgroundColor: palette.brand.orange,
  },
  followingBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  followLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
  },
  followingLabel: {
    color: palette.ink.onDarkStrong,
  },
  msgBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  msgLabel: {
    fontFamily: typography.buttonLabel.fontFamily,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing['3'],
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
  },
  tabActive: {
    color: palette.ink.onDarkStrong,
  },
  tabIndicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.brand.orange,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingTop: 2,
  },
  tile: {
    width: '33.2%',
    aspectRatio: 1,
  },
  tileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
