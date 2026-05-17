import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, radius, spacing, typography } from '@/src/theme';

type Notif = {
  id: string;
  type: 'order' | 'follow' | 'like' | 'comment' | 'sale' | 'referral' | 'escrow' | 'bot' | 'news';
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
    type: 'escrow',
    title: 'EscrowBot · payment held',
    body: '₦18,500 paid into Vibe escrow for order #8814564. Vendor notified.',
    time: 'now',
    unread: true,
    href: '/orders/8814564?state=confirmed',
  },
  {
    id: 'n2',
    type: 'referral',
    title: 'You earned ₦50 from a repost',
    body: 'A buyer reached @sarahsboutique through your repost and bought the Office two-piece.',
    time: '6m',
    unread: true,
    href: '/wallet/referrals',
  },
  {
    id: 'n3',
    type: 'order',
    title: 'Order confirmed',
    body: 'Your order #8814564 from Sarah\'s Boutique has been confirmed.',
    time: '12m',
    unread: true,
    href: '/orders/8814564?state=confirmed',
  },
  {
    id: 'n4',
    type: 'follow',
    title: 'Aisha Bello followed you',
    body: 'You have 4 new followers this week.',
    time: '20m',
    avatar: require('@/assets/figma/story-1.png'),
    unread: true,
  },
  {
    id: 'n5',
    type: 'bot',
    title: 'BookBot started a poll',
    body: 'Christian Romance · "What should we read next month?" — vote now.',
    time: '38m',
    unread: true,
    href: '/hive/books/romance/christian',
  },
  {
    id: 'n6',
    type: 'like',
    title: 'Joshua liked your post',
    body: '"Ankara high shoulder fitted gown" — 27 likes in the last hour',
    time: '1h',
    avatar: require('@/assets/figma/story-2.png'),
  },
  {
    id: 'n7',
    type: 'referral',
    title: 'You earned ₦50 from a repost',
    body: '@tolathreads · Super Eagles jersey sale via your repost.',
    time: '2h',
    href: '/wallet/referrals',
  },
  {
    id: 'n8',
    type: 'sale',
    title: 'Flash sale on Beauty',
    body: 'Up to 30% off premium skincare for the next 6 hours.',
    time: '3h',
  },
  {
    id: 'n9',
    type: 'comment',
    title: 'Olusayo commented',
    body: '"Absolutely stunning fit — do you ship to Abuja?"',
    time: '4h',
    avatar: require('@/assets/figma/store-avatar.png'),
  },
  {
    id: 'n10',
    type: 'news',
    title: 'NewsBot · Vibe Insight',
    body: 'Football jerseys trending +412% in Lagos — restock to ride the wave.',
    time: '5h',
    href: '/(tabs)/news',
  },
  {
    id: 'n11',
    type: 'escrow',
    title: 'EscrowBot · funds released',
    body: '₦9,200 released to your wallet — GadgetFix order #8814566 delivered.',
    time: '6h',
    href: '/(tabs)/wallet',
  },
  {
    id: 'n12',
    type: 'bot',
    title: 'SportBot · live thread',
    body: 'Super Eagles vs Morocco is LIVE — join the play-by-play.',
    time: '9h',
    href: '/hive/sport/football/super-eagles',
  },
  {
    id: 'n13',
    type: 'follow',
    title: 'Sarah\'s Boutique followed you',
    body: 'Vendor account — verified',
    time: '12h',
    avatar: require('@/assets/figma/store-avatar.png'),
  },
  {
    id: 'n14',
    type: 'order',
    title: 'Delivery confirmed',
    body: 'Beauty by Femi · Glow hydration kit delivered. Leave a review?',
    time: '1d',
    href: '/orders/ord-6/review',
  },
  {
    id: 'n15',
    type: 'sale',
    title: '#NaijaFashion is trending',
    body: 'Vendors you follow just dropped 6 new items in this tag.',
    time: '1d',
  },
  {
    id: 'n16',
    type: 'comment',
    title: 'Tunde replied to your repost',
    body: '"Same! Just got mine, the fit is unreal."',
    time: '2d',
    avatar: require('@/assets/figma/story-3.png'),
  },
  {
    id: 'n17',
    type: 'referral',
    title: 'Repost milestone',
    body: 'Your @aishathreads repost passed 100 clicks — keep them coming.',
    time: '3d',
    href: '/wallet/referrals',
  },
];

const ICON_FOR: Record<Notif['type'], { icon: keyof typeof Ionicons.glyphMap; tint: string }> = {
  order: { icon: 'cube', tint: 'rgba(91, 168, 232, 0.20)' },          // sky
  follow: { icon: 'person-add', tint: 'rgba(63, 201, 192, 0.20)' },   // teal
  like: { icon: 'heart', tint: 'rgba(255, 111, 74, 0.22)' },          // coral
  comment: { icon: 'chatbubble', tint: 'rgba(155, 139, 232, 0.22)' }, // lavender
  sale: { icon: 'pricetag', tint: 'rgba(216, 149, 68, 0.22)' },       // orange (keep — sale = CTA)
  referral: { icon: 'repeat', tint: 'rgba(232, 192, 74, 0.22)' },     // gold (money signal)
  escrow: { icon: 'lock-closed', tint: 'rgba(91, 168, 232, 0.20)' },  // sky
  bot: { icon: 'sparkles', tint: 'rgba(155, 139, 232, 0.22)' },       // lavender (AI)
  news: { icon: 'newspaper', tint: 'rgba(63, 201, 192, 0.20)' },      // teal
};

export default function NotificationsScreen() {
  const [allRead, setAllRead] = useState(false);
  const list = allRead
    ? NOTIFICATIONS.map((n) => ({ ...n, unread: false }))
    : NOTIFICATIONS;

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Notifications"
        showBack
        rightAction={
          <Pressable hitSlop={8} onPress={() => setAllRead(true)}>
            <Ionicons name="checkmark-done" size={20} color={palette.brand.orange} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {list.map((n) => {
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
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
  },
  unread: {
    borderColor: 'rgba(216, 149, 68,0.30)',
    backgroundColor: 'rgba(216, 149, 68,0.06)',
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
