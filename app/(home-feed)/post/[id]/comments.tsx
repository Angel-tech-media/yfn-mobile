import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { palette, spacing, typography } from '@/src/theme';

const STORY_1 = require('@/assets/figma/story-1.png');
const STORY_2 = require('@/assets/figma/story-2.png');
const STORY_3 = require('@/assets/figma/story-3.png');
const STORY_4 = require('@/assets/figma/story-4.png');
const STORY_5 = require('@/assets/figma/story-5.png');
const STORE_AVATAR = require('@/assets/figma/store-avatar.png');

type Comment = {
  id: string;
  author: string;
  handle: string;
  avatar: any;
  text: string;
  time: string;
  likes: number;
  verified?: boolean;
};

const SEED: Comment[] = [
  { id: 'c1', author: 'Aisha Bello', handle: 'aishabello', avatar: STORY_1, text: 'This drop is fire 🔥 Reserving size M.', time: '12m', likes: 24 },
  { id: 'c2', author: 'Olufemi A.', handle: 'olufemia', avatar: STORY_2, text: 'Reposted to my profile — buyers, the fit is real.', time: '23m', likes: 41 },
  { id: 'c3', author: 'Bisi A.', handle: 'bisia', avatar: STORY_3, text: 'Do you ship to Abuja? Need by Friday for a wedding.', time: '34m', likes: 9 },
  { id: 'c4', author: "Sarah's Boutique", handle: 'sarahsboutique', avatar: STORE_AVATAR, text: 'Yes 🇳🇬 same-day dispatch if you order before 2pm. DM your address.', time: '28m', likes: 32, verified: true },
  { id: 'c5', author: 'Tunde Otun', handle: 'tundeotun', avatar: STORY_4, text: 'The embroidery! Who did this for you?', time: '41m', likes: 18 },
  { id: 'c6', author: 'Doyin Ojo', handle: 'doyinojo', avatar: STORY_5, text: 'Saved this one. Birthday gift sorted 🎁', time: '1h', likes: 12 },
  { id: 'c7', author: 'Mide', handle: 'midemoji', avatar: STORY_2, text: 'Can I get a photo of the back? Considering for my Saturday shoot.', time: '2h', likes: 7 },
];

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [composer, setComposer] = useState('');
  const [comments, setComments] = useState(SEED);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  void id;

  const toggleLike = (cId: string) =>
    setLikedIds((s) => ({ ...s, [cId]: !s[cId] }));

  const post = () => {
    const text = composer.trim();
    if (!text) return;
    setComments((s) => [
      {
        id: `c-${Date.now()}`,
        author: 'David Okpo',
        handle: 'davidokpo',
        avatar: STORY_1,
        text,
        time: 'now',
        likes: 0,
      },
      ...s,
    ]);
    setComposer('');
  };

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={22} color={palette.ink.onLightStrong} />
          </Pressable>
          <Text style={styles.title}>Comments</Text>
          <Pressable hitSlop={8} accessibilityLabel="Share">
            <Ionicons
              name="paper-plane-outline"
              size={20}
              color={palette.ink.onLightStrong}
            />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}>
            <Text style={styles.counter}>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Text>

            {comments.map((c) => {
              const liked = !!likedIds[c.id];
              return (
                <View key={c.id} style={styles.row}>
                  <Pressable onPress={() => router.push(`/u/${c.handle}` as never)}>
                    <Image source={c.avatar} style={styles.avatar} />
                  </Pressable>
                  <View style={styles.bubbleWrap}>
                    <View style={styles.headerRow}>
                      <Pressable
                        onPress={() => router.push(`/u/${c.handle}` as never)}>
                        <Text style={styles.author}>{c.author}</Text>
                      </Pressable>
                      {c.verified ? (
                        <View style={styles.verifyDot}>
                          <Ionicons name="shield-checkmark" size={9} color="#fff" />
                        </View>
                      ) : null}
                      <Text style={styles.time}>· {c.time}</Text>
                    </View>
                    <Text style={styles.text}>{c.text}</Text>
                    <View style={styles.actionsRow}>
                      <Pressable hitSlop={6} onPress={() => toggleLike(c.id)}>
                        <Text style={styles.actionText}>{liked ? 'Liked' : 'Like'}</Text>
                      </Pressable>
                      <Text style={styles.actionDot}>·</Text>
                      <Pressable hitSlop={6}>
                        <Text style={styles.actionText}>Reply</Text>
                      </Pressable>
                      {c.likes + (liked ? 1 : 0) > 0 ? (
                        <>
                          <Text style={styles.actionDot}>·</Text>
                          <Text style={styles.actionLikes}>
                            {c.likes + (liked ? 1 : 0)} likes
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                  <Pressable hitSlop={6} onPress={() => toggleLike(c.id)}>
                    <Ionicons
                      name={liked ? 'heart' : 'heart-outline'}
                      size={14}
                      color={liked ? palette.status.danger : palette.ink.onLightSubtle}
                    />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.composer}>
            <Image source={STORY_1} style={styles.composerAvatar} />
            <TextInput
              value={composer}
              onChangeText={setComposer}
              placeholder="Add a comment…"
              placeholderTextColor={palette.ink.onLightSubtle}
              style={styles.composerInput}
              multiline
            />
            <Pressable
              onPress={post}
              hitSlop={6}
              style={[styles.postBtn, composer.trim() ? null : { opacity: 0.4 }]}>
              <Text style={styles.postLabel}>Post</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.bodyEmphasis, fontSize: 15, color: palette.ink.onLightStrong },
  list: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    paddingBottom: spacing['8'],
  },
  counter: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginBottom: spacing['3'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    alignItems: 'flex-start',
  },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  bubbleWrap: { flex: 1, gap: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  author: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.ink.onLightStrong,
  },
  verifyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.status.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { ...typography.caption, color: palette.ink.onLightSubtle },
  text: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink.onLightStrong,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  actionText: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  actionLikes: { ...typography.caption, color: palette.ink.onLightSubtle },
  actionDot: { ...typography.caption, color: palette.ink.onLightSubtle },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  composerAvatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 4 },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing['3'],
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: palette.ink.onLightStrong,
    ...typography.body,
    fontSize: 14,
  },
  postBtn: { paddingHorizontal: spacing['2'], paddingVertical: 12 },
  postLabel: {
    ...typography.bodyEmphasis,
    color: palette.brand.orange,
    fontSize: 14,
  },
});
