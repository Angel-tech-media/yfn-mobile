import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { palette, spacing, typography } from '@/src/theme';

const STORY_AVATARS = [
  require('@/assets/figma/story-1.png'),
  require('@/assets/figma/story-2.png'),
  require('@/assets/figma/story-3.png'),
  require('@/assets/figma/story-4.png'),
  require('@/assets/figma/story-5.png'),
];

const THREADS = [
  { id: 't1', name: 'EscrowBot · order ord-1', preview: '₦18,500 held in escrow. Vendor notified.', time: 'now', unread: 1, avatar: STORY_AVATARS[0] },
  { id: 't2', name: 'Aisha Bello', preview: 'Thanks! When can I expect delivery?', time: '2m', unread: 2, avatar: STORY_AVATARS[0] },
  { id: 't3', name: 'Joshua Olamilekan-Ayan', preview: 'Order confirmed ✔', time: '14m', unread: 0, avatar: STORY_AVATARS[1] },
  { id: 't4', name: 'Olusayo Odukoya', preview: 'Loved the dress!', time: '1h', unread: 1, avatar: STORY_AVATARS[2] },
  { id: 't5', name: 'Janet Ogborini', preview: 'Will restock next week', time: '3h', unread: 0, avatar: STORY_AVATARS[3] },
  { id: 't6', name: "Sarah's Boutique", preview: 'Your custom fitting is ready — drop by anytime today', time: '4h', unread: 1, avatar: STORY_AVATARS[4] },
  { id: 't7', name: 'GadgetFix Hub', preview: 'Repair complete. Pick-up code: 7Q2K', time: '5h', unread: 0, avatar: STORY_AVATARS[0] },
  { id: 't8', name: 'MarketBot', preview: 'New tailor near you matches your saved searches.', time: '7h', unread: 0, avatar: STORY_AVATARS[1] },
  { id: 't9', name: 'Naija Kitchen', preview: 'Confirming party platter for Saturday 6pm.', time: '9h', unread: 1, avatar: STORY_AVATARS[2] },
  { id: 't10', name: 'Mide Studios', preview: 'Sent you the gallery preview — let me know your picks', time: '12h', unread: 0, avatar: STORY_AVATARS[3] },
  { id: 't11', name: 'Tola Threads', preview: 'Jersey size 42 — back in stock 🇳🇬', time: '1d', unread: 0, avatar: STORY_AVATARS[4] },
  { id: 't12', name: 'Bisi A.', preview: 'You: ok cool, see you Friday', time: '1d', unread: 0, avatar: STORY_AVATARS[0] },
  { id: 't13', name: 'Mide', preview: 'Sent you a reel — check it out', time: '2d', unread: 0, avatar: STORY_AVATARS[1] },
  { id: 't14', name: 'Doyin Beauty', preview: 'Confirmed: Saturday 9am, your address', time: '3d', unread: 0, avatar: STORY_AVATARS[2] },
];

export default function InboxScreen() {
  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <Ionicons name="create-outline" size={22} color={palette.ink.onDarkStrong} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {THREADS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/messages/${t.id}` as never)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
              <Avatar size={48} source={t.avatar} />
              <View style={styles.body}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.preview} numberOfLines={1}>{t.preview}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.time}>{t.time}</Text>
                {t.unread > 0 ? (
                  <View style={styles.unreadBubble}>
                    <Text style={styles.unreadText}>{t.unread}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </EspressoBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
  },
  title: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: palette.ink.onDarkStrong,
  },
  list: {
    paddingHorizontal: spacing['5'],
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
  },
  body: { flex: 1, gap: 2 },
  name: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 15,
    lineHeight: 20,
    color: palette.ink.onDarkStrong,
  },
  preview: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkMuted,
  },
  meta: { alignItems: 'flex-end', gap: 6 },
  time: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkMuted,
  },
  unreadBubble: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: '#FFFFFF',
  },
});
