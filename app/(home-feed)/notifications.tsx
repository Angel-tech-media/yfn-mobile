import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Notif = {
  id: string;
  type: 'order' | 'follow' | 'like' | 'comment' | 'sale';
  title: string;
  body: string;
  time: string;
  avatar?: any;
  unread?: boolean;
  href?: string;
};

const NOTIFICATIONS: Notif[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Order confirmed',
    body: 'Your order #8814564 from Sarah’s Boutique has been confirmed.',
    time: '2m',
    unread: true,
    href: '/orders/8814564?state=confirmed',
  },
  {
    id: 'n2',
    type: 'follow',
    title: 'New follower',
    body: 'Aisha Bello started following you.',
    time: '14m',
    avatar: require('@/assets/figma/story-1.png'),
    unread: true,
  },
  {
    id: 'n3',
    type: 'like',
    title: 'Joshua liked your post',
    body: '“Ankara high shoulder fitted gown”',
    time: '1h',
    avatar: require('@/assets/figma/story-2.png'),
  },
  {
    id: 'n4',
    type: 'sale',
    title: 'Flash sale on Beauty',
    body: 'Up to 30% off premium skincare for the next 6 hours.',
    time: '3h',
  },
  {
    id: 'n5',
    type: 'comment',
    title: 'Olusayo commented',
    body: '“Absolutely stunning fit — do you ship to Abuja?”',
    time: '1d',
    avatar: require('@/assets/figma/store-avatar.png'),
  },
];

const ICON_FOR: Record<Notif['type'], { icon: keyof typeof Ionicons.glyphMap; tint: string }> = {
  order: { icon: 'cube', tint: 'rgba(33,150,243,0.18)' },
  follow: { icon: 'person-add', tint: 'rgba(76,175,80,0.18)' },
  like: { icon: 'heart', tint: 'rgba(244,67,54,0.18)' },
  comment: { icon: 'chatbubble', tint: 'rgba(186,104,200,0.18)' },
  sale: { icon: 'pricetag', tint: 'rgba(253,134,22,0.18)' },
};

export default function NotificationsScreen() {
  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Notifications"
        showBack
        rightAction={
          <Pressable hitSlop={8}>
            <Ionicons name="checkmark-done" size={20} color={palette.brand.orange} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {NOTIFICATIONS.map((n) => {
          const meta = ICON_FOR[n.type];
          return (
            <Pressable
              key={n.id}
              onPress={() => n.href && router.push(n.href as never)}
              style={({ pressed }) => [
                styles.row,
                n.unread && styles.unread,
                pressed && { opacity: 0.85 },
              ]}>
              {n.avatar ? (
                <Avatar size={44} source={n.avatar} />
              ) : (
                <View style={[styles.iconWrap, { backgroundColor: meta.tint }]}>
                  <Ionicons name={meta.icon} size={20} color={palette.ink.onDarkStrong} />
                </View>
              )}
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.titleText} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.time}>{n.time}</Text>
                </View>
                <Text style={styles.bodyText} numberOfLines={2}>{n.body}</Text>
              </View>
              {n.unread ? <View style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40, gap: spacing['2'] },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
    padding: spacing['3'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(20,12,8,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
  },
  unread: {
    borderColor: 'rgba(253,134,22,0.30)',
    backgroundColor: 'rgba(253,134,22,0.06)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleText: {
    flex: 1,
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 14,
    lineHeight: 19,
    color: palette.ink.onDarkStrong,
  },
  bodyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkSoft,
  },
  time: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkMuted,
    marginLeft: spacing['2'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.brand.orange,
  },
});
