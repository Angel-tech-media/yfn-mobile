import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { InputBar } from '@/components/ui/InputBar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TopBar } from '@/components/ui/TopBar';
import { palette, spacing, typography } from '@/src/theme';

type Comment = {
  id: string;
  author: string;
  body: string;
  time: string;
  avatar: any;
  likes: number;
  liked?: boolean;
};

const SEED: Comment[] = [
  {
    id: 'c1',
    author: 'Aisha Bello',
    body: 'Absolutely stunning! Do you ship to Abuja?',
    time: '2h',
    avatar: require('@/assets/figma/story-1.png'),
    likes: 12,
  },
  {
    id: 'c2',
    author: 'Joshua Olamilekan-Ayan',
    body: 'Where can I get this exact one?',
    time: '1h',
    avatar: require('@/assets/figma/story-2.png'),
    likes: 4,
  },
  {
    id: 'c3',
    author: 'Olusayo Odukoya',
    body: 'Linked the product page on the post — tap "Buy now" 💖',
    time: '45m',
    avatar: require('@/assets/figma/store-avatar.png'),
    likes: 28,
    liked: true,
  },
  {
    id: 'c4',
    author: 'Mide',
    body: 'Saving this for next month!',
    time: '20m',
    avatar: require('@/assets/figma/story-3.png'),
    likes: 0,
  },
];

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [comments, setComments] = useState<Comment[]>(SEED);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!draft.trim()) return;
    setComments((arr) => [
      ...arr,
      {
        id: `c-${Date.now()}`,
        author: 'David Okpo',
        body: draft.trim(),
        time: 'now',
        avatar: undefined,
        likes: 0,
      },
    ]);
    setDraft('');
  };

  const toggleLike = (cid: string) => {
    setComments((arr) =>
      arr.map((c) =>
        c.id === cid
          ? {
              ...c,
              liked: !c.liked,
              likes: c.likes + (c.liked ? -1 : 1),
            }
          : c
      )
    );
  };

  return (
    <ScreenContainer variant="espresso" edges={['top']}>
      <TopBar title={`Comments · ${comments.length}`} showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {comments.map((c) => (
            <View key={c.id} style={styles.row}>
              {c.avatar ? (
                <Avatar size={36} source={c.avatar} />
              ) : (
                <Avatar size={36} initials="DO" />
              )}
              <View style={styles.body}>
                <Text style={styles.headerLine}>
                  <Text style={styles.author}>{c.author}</Text>
                  <Text style={styles.time}>  ·  {c.time}</Text>
                </Text>
                <Text style={styles.bodyText}>{c.body}</Text>
                <View style={styles.actionsRow}>
                  <Pressable onPress={() => toggleLike(c.id)} hitSlop={6} style={styles.likeBtn}>
                    <Ionicons
                      name={c.liked ? 'heart' : 'heart-outline'}
                      size={14}
                      color={c.liked ? '#FF3B47' : palette.ink.onDarkSoft}
                    />
                    <Text style={styles.likeCount}>{c.likes}</Text>
                  </Pressable>
                  <Pressable hitSlop={6}>
                    <Text style={styles.replyText}>Reply</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <Avatar size={32} initials="DO" />
          <View style={{ flex: 1 }}>
            <InputBar
              placeholder={`Comment as @davidokpo · post ${String(id).slice(0, 6)}`}
              value={draft}
              onChangeText={setDraft}
              onSend={send}
              showEmoji
              showSend
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 24, gap: spacing['4'] },
  row: { flexDirection: 'row', gap: spacing['3'] },
  body: { flex: 1, gap: 4 },
  headerLine: { lineHeight: 18 },
  author: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  time: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    color: palette.ink.onDarkMuted,
  },
  bodyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: palette.ink.onDarkStrong,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing['4'],
    paddingTop: 4,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  replyText: {
    fontFamily: typography.bodyEmphasis.fontFamily,
    fontSize: 11,
    color: palette.ink.onDarkSoft,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
    paddingHorizontal: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
});
