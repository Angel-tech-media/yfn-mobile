import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { palette, radius, spacing, typography } from '@/src/theme';

import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Action = {
  key: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  href: string;
};

const ACTIONS: Action[] = [
  {
    key: 'post',
    label: 'New post',
    subtitle: 'Share a photo or update with your followers',
    icon: 'camera-outline',
    tint: 'rgba(76,175,80,0.18)',
    href: '/create/post',
  },
  {
    key: 'story',
    label: 'New story',
    subtitle: 'Share a moment for 24 hours',
    icon: 'sparkles-outline',
    tint: 'rgba(186,104,200,0.18)',
    href: '/create/story',
  },
  {
    key: 'reel',
    label: 'New reel',
    subtitle: 'Record a short video',
    icon: 'play-circle-outline',
    tint: 'rgba(244,67,54,0.18)',
    href: '/create/reel',
  },
  {
    key: 'browse-reels',
    label: 'Browse reels',
    subtitle: 'Watch the latest from creators you follow',
    icon: 'film-outline',
    tint: 'rgba(33,150,243,0.18)',
    href: '/reels',
  },
  {
    key: 'product',
    label: 'New product',
    subtitle: 'List a product for sale',
    icon: 'pricetag-outline',
    tint: 'rgba(253,134,22,0.18)',
    href: '/products/add',
  },
];

export function CreateSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Create</Text>
      <View style={styles.list}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.key}
            onPress={() => {
              onClose();
              router.push(a.href as never);
            }}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <View style={[styles.iconWrap, { backgroundColor: a.tint }]}>
              <Ionicons name={a.icon} size={22} color={palette.ink.onDarkStrong} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.label}>{a.label}</Text>
              <Text style={styles.subtitle}>{a.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.ink.onDarkMuted} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['3'],
  },
  list: {
    gap: spacing['2'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  subtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink.onDarkMuted,
  },
});
