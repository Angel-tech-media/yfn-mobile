import { useEffect, useMemo, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EspressoBackground } from '@/components/ui/EspressoBackground';
import { LiveScoreCard } from '@/components/ui/LiveScoreCard';
import { findHiveNode, type HiveNode } from '@/src/data/hive';
import { useCommunityMessages, useHiveChat } from '@/src/store/hive-chat';
import { palette, radius, spacing, typography } from '@/src/theme';

export default function HivePathScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slugPath = useMemo<string[]>(() => {
    const raw = params.slug;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }, [params.slug]);

  const { node, trail } = findHiveNode(slugPath);

  if (!node) {
    return (
      <EspressoBackground variant="espresso">
        <SafeAreaView edges={['top']} style={styles.safe}>
          <Header trail={trail} onBack={() => router.back()} />
          <View style={styles.center}>
            <Text style={styles.notFound}>That community doesn't exist.</Text>
          </View>
        </SafeAreaView>
      </EspressoBackground>
    );
  }

  const isCommunity = !node.children || node.children.length === 0;

  return (
    <EspressoBackground variant="espresso">
      <SafeAreaView edges={['top']} style={styles.safe}>
        <Header trail={trail} onBack={() => router.back()} />
        {isCommunity ? (
          <CommunityView node={node} />
        ) : (
          <FolderView node={node} basePath={slugPath} />
        )}
      </SafeAreaView>
    </EspressoBackground>
  );
}

/** Windows-Explorer-style breadcrumb header. Each segment is tappable. */
function Header({ trail, onBack }: { trail: HiveNode[]; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={20} color={palette.ink.onDarkStrong} />
      </Pressable>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.breadcrumb}>
        <Pressable
          onPress={() => router.replace('/(tabs)/hive' as never)}
          hitSlop={6}
          style={styles.crumbBtn}>
          <Ionicons name="apps" size={13} color={palette.brand.orange} />
          <Text style={styles.crumbRoot}>Hive</Text>
        </Pressable>
        {trail.map((seg, i) => (
          <View key={seg.slug} style={styles.crumbBtn}>
            <Ionicons name="chevron-forward" size={11} color={palette.ink.onDarkMuted} />
            <Pressable
              hitSlop={6}
              onPress={() => {
                const path = trail
                  .slice(0, i + 1)
                  .map((n) => n.slug)
                  .join('/');
                router.replace(`/hive/${path}` as never);
              }}>
              <Text
                style={[
                  styles.crumbSeg,
                  i === trail.length - 1 && styles.crumbSegActive,
                ]}>
                {seg.name}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/** Folder = list of subcategories / sub-communities. */
function FolderView({ node, basePath }: { node: HiveNode; basePath: string[] }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={styles.folderHeader}>
        <Text style={styles.folderEmoji}>{node.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.folderName}>{node.name}</Text>
          {node.description ? (
            <Text style={styles.folderDescription}>{node.description}</Text>
          ) : null}
        </View>
      </View>

      {node.children?.map((child) => {
        const childPath = [...basePath, child.slug].join('/');
        const isLeaf = !child.children || child.children.length === 0;
        return (
          <Pressable
            key={child.slug}
            onPress={() => router.push(`/hive/${childPath}` as never)}
            style={({ pressed }) => [styles.folderRow, pressed && { opacity: 0.92 }]}>
            <View style={styles.folderRowEmoji}>
              <Text style={styles.categoryEmoji}>{child.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.folderRowName}>{child.name}</Text>
              <Text style={styles.folderRowMeta}>
                {isLeaf
                  ? `${formatMembers(child.members ?? 0)} members`
                  : `${child.children?.length ?? 0} sub-categories`}
              </Text>
              {isLeaf && child.pinnedTopic ? (
                <Text style={styles.folderRowTopic} numberOfLines={1}>
                  📌 {child.pinnedTopic}
                </Text>
              ) : null}
            </View>
            <Ionicons
              name={isLeaf ? 'chatbubbles-outline' : 'chevron-forward'}
              size={isLeaf ? 18 : 16}
              color={isLeaf ? palette.brand.orange : palette.ink.onDarkSoft}
            />
          </Pressable>
        );
      })}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

/** Leaf community = pinned topic + AI bot + chat thread + composer. */
function CommunityView({ node }: { node: HiveNode }) {
  const [composer, setComposer] = useState('');
  const [joined, setJoined] = useState(false);
  const botName = (node.bot ?? 'vibebot').replace(/bot$/, '') + 'Bot';
  const liveMessages = useCommunityMessages(node.slug);
  const sendChat = useHiveChat((s) => s.send);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to the newest message when one arrives so the sender sees it.
  useEffect(() => {
    if (liveMessages.length === 0) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [liveMessages.length]);

  const submit = () => {
    const text = composer.trim();
    if (!text) return;
    sendChat(node.slug, text);
    setComposer('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Group hero */}
        <LinearGradient
          colors={['rgba(216, 149, 68,0.18)', 'transparent']}
          style={styles.communityHero}>
          <View style={styles.communityAvatar}>
            <Text style={{ fontSize: 28 }}>{node.emoji}</Text>
          </View>
          <Text style={styles.communityName}>{node.name}</Text>
          <View style={styles.communityMeta}>
            <Ionicons name="people" size={12} color={palette.ink.onDarkSoft} />
            <Text style={styles.communityMembers}>
              {formatMembers(node.members ?? 0)} members
            </Text>
            <View style={styles.dot} />
            <Text style={styles.communityMembers}>Active now: 142</Text>
          </View>
          {node.description ? (
            <Text style={styles.communityDesc}>{node.description}</Text>
          ) : null}
          <View style={styles.communityActions}>
            <Pressable
              onPress={() => setJoined((s) => !s)}
              style={[styles.joinBtn, joined && styles.joinedBtn]}>
              <Ionicons
                name={joined ? 'checkmark' : 'add'}
                size={16}
                color={joined ? palette.ink.onLightStrong : '#fff'}
              />
              <Text
                style={[
                  styles.joinLabel,
                  joined && { color: palette.ink.onLightStrong },
                ]}>
                {joined ? 'Joined' : 'Join community'}
              </Text>
            </Pressable>
            <Pressable style={styles.iconAction}>
              <Ionicons name="notifications-outline" size={16} color={palette.ink.onDarkStrong} />
            </Pressable>
            <Pressable style={styles.iconAction}>
              <Ionicons name="ellipsis-horizontal" size={16} color={palette.ink.onDarkStrong} />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Live match scoreboard — only on sport communities with a live event */}
        {node.liveMatch ? (
          <LiveScoreCard
            title={node.liveMatch.title}
            meta={node.liveMatch.meta}
            status={node.liveMatch.status}
            periodLabel={node.liveMatch.periodLabel}
            home={node.liveMatch.home}
            away={node.liveMatch.away}
          />
        ) : null}

        {/* Pinned topic */}
        {node.pinnedTopic ? (
          <View style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <Ionicons name="trending-up" size={14} color={palette.brand.accentLime} />
              <Text style={styles.topicLabel}>Trending topic · weighed by {botName}</Text>
            </View>
            <Text style={styles.topicText}>📌 {node.pinnedTopic}</Text>
            <View style={styles.topicStats}>
              <Stat icon="chatbubbles" value="1.2K msgs" />
              <Stat icon="people" value="48 voices" />
              <Stat icon="time" value="3h trending" />
            </View>
          </View>
        ) : null}

        {/* Bot welcome */}
        <BotMessage
          botName={botName}
          message={`Welcome to ${node.name}! Tap the topic above to jump into the live thread, or drop a message and I'll keep things moving.`}
        />

        {/* Sample chat thread */}
        <UserMessage
          author="Bisi A."
          initial="B"
          time="2m"
          text="Anyone reading the latest chapter? The plot twist had me speechless 😭"
        />
        <UserMessage
          author="Tunde O."
          initial="T"
          time="1m"
          text="Same! Can't believe what happened with the lead character."
          mine
        />

        {/* Bot poll */}
        <BotPoll
          botName={botName}
          question="Quick poll — what should we read next month?"
          options={[
            { label: 'A Court of Mist and Fury', votes: 312 },
            { label: 'Half of a Yellow Sun', votes: 481 },
            { label: 'The Fishermen', votes: 189 },
          ]}
        />

        <UserMessage
          author="Chidera N."
          initial="C"
          time="just now"
          text="Voted! Curious what wins."
        />

        {/* Bot prompt when chat is dry */}
        <BotMessage
          botName={botName}
          message="Things are quiet — quick prompt: which character would you swap into a different book? 👇"
        />

        {/* Live (user-typed) messages persist across navigation */}
        {liveMessages.map((m) => (
          <UserMessage
            key={m.id}
            author={m.author}
            initial={m.initial}
            time={m.time}
            text={m.text}
            mine={m.mine}
          />
        ))}
      </ScrollView>

      {/* Composer */}
      <View style={styles.composerWrap}>
        <Pressable hitSlop={8} style={styles.composerIcon}>
          <Ionicons name="add" size={20} color={palette.ink.onDarkSoft} />
        </Pressable>
        <TextInput
          value={composer}
          onChangeText={setComposer}
          placeholder={`Message ${node.name}…`}
          placeholderTextColor={palette.ink.onDarkMuted}
          style={styles.composerInput}
          multiline
        />
        <Pressable onPress={submit} hitSlop={8} style={styles.composerSend}>
          <Ionicons name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function BotMessage({ botName, message }: { botName: string; message: string }) {
  return (
    <View style={styles.botRow}>
      <View style={styles.botAvatar}>
        <Ionicons name="sparkles" size={14} color="#fff" />
      </View>
      <View style={styles.botBubble}>
        <Text style={styles.botBubbleName}>{botName}</Text>
        <Text style={styles.botBubbleText}>{message}</Text>
      </View>
    </View>
  );
}

function BotPoll({
  botName,
  question,
  options,
}: {
  botName: string;
  question: string;
  options: Array<{ label: string; votes: number }>;
}) {
  const total = options.reduce((acc, o) => acc + o.votes, 0);
  return (
    <View style={styles.botRow}>
      <View style={styles.botAvatar}>
        <Ionicons name="sparkles" size={14} color="#fff" />
      </View>
      <View style={styles.pollBubble}>
        <Text style={styles.botBubbleName}>{botName} · poll</Text>
        <Text style={styles.pollQuestion}>{question}</Text>
        {options.map((o) => {
          const pct = total ? Math.round((o.votes / total) * 100) : 0;
          return (
            <View key={o.label} style={styles.pollOption}>
              <View style={[styles.pollFill, { width: `${pct}%` }]} />
              <View style={styles.pollOptionRow}>
                <Text style={styles.pollLabel}>{o.label}</Text>
                <Text style={styles.pollPct}>{pct}%</Text>
              </View>
            </View>
          );
        })}
        <Text style={styles.pollTotal}>{total} votes</Text>
      </View>
    </View>
  );
}

function UserMessage({
  author,
  initial,
  time,
  text,
  mine,
}: {
  author: string;
  initial: string;
  time: string;
  text: string;
  mine?: boolean;
}) {
  if (mine) {
    return (
      <View style={[styles.userRow, { justifyContent: 'flex-end' }]}>
        <View style={[styles.userBubble, styles.userBubbleMine]}>
          <Text style={styles.userBubbleText}>{text}</Text>
          <Text style={styles.userBubbleTime}>{time}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.userRow}>
      <View style={styles.userAvatar}>
        <Text style={styles.userInitial}>{initial}</Text>
      </View>
      <View style={styles.userBubble}>
        <Text style={styles.userBubbleAuthor}>
          {author} <Text style={styles.userBubbleTime}>· {time}</Text>
        </Text>
        <Text style={styles.userBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function Stat({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={11} color={palette.ink.onDarkSoft} />
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

function formatMembers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: {
    ...typography.body,
    color: palette.ink.onDarkSoft,
  },
  header: {
    paddingHorizontal: spacing['3'],
    paddingTop: spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['2'],
    minHeight: 36,
  },
  crumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crumbRoot: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.brand.orange,
  },
  crumbSeg: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkSoft,
  },
  crumbSegActive: {
    color: palette.ink.onDarkStrong,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  scroll: { paddingBottom: 100 },

  // Folder
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
    paddingBottom: spacing['3'],
  },
  folderEmoji: { fontSize: 36 },
  folderName: { ...typography.h2, color: palette.ink.onDarkStrong },
  folderDescription: {
    ...typography.body,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: palette.line.onDark,
  },
  folderRowEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderRowName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onDarkStrong,
  },
  folderRowMeta: {
    ...typography.caption,
    color: palette.ink.onDarkMuted,
    marginTop: 2,
  },
  folderRowTopic: {
    ...typography.caption,
    color: palette.brand.orange,
    marginTop: 2,
  },
  categoryEmoji: { fontSize: 20 },

  // Community
  communityHero: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['4'],
    paddingBottom: spacing['4'],
    alignItems: 'center',
    gap: 6,
  },
  communityAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  communityName: {
    ...typography.h2,
    color: palette.ink.onDarkStrong,
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityMembers: {
    ...typography.caption,
    color: palette.ink.onDarkSoft,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: palette.ink.onDarkMuted,
  },
  communityDesc: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkMuted,
    textAlign: 'center',
    marginTop: spacing['2'],
    paddingHorizontal: spacing['4'],
  },
  communityActions: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['3'],
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['4'],
    height: 36,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
  },
  joinedBtn: {
    backgroundColor: palette.bg.surface,
  },
  joinLabel: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: '#fff',
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  topicCard: {
    marginHorizontal: spacing['4'],
    marginTop: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(216, 149, 68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.30)',
    gap: spacing['2'],
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicLabel: {
    ...typography.small,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicText: {
    ...typography.title,
    fontSize: 15,
    color: palette.ink.onDarkStrong,
  },
  topicStats: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
  },

  // Bot
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['3'],
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botBubble: {
    flex: 1,
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(216, 149, 68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(216, 149, 68,0.25)',
  },
  botBubbleName: {
    ...typography.small,
    color: palette.brand.orange,
    fontFamily: typography.bodyEmphasis.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  botBubbleText: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  pollBubble: {
    flex: 1,
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: palette.line.onDark,
    gap: 6,
  },
  pollQuestion: {
    ...typography.bodyEmphasis,
    fontSize: 14,
    color: palette.ink.onDarkStrong,
    marginBottom: spacing['2'],
  },
  pollOption: {
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: spacing['3'],
  },
  pollFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(216, 149, 68,0.25)',
  },
  pollOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollLabel: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  pollPct: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.brand.orange,
  },
  pollTotal: {
    ...typography.small,
    color: palette.ink.onDarkMuted,
    marginTop: 4,
  },

  // User messages
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['3'],
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    ...typography.bodyEmphasis,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  userBubble: {
    maxWidth: '80%',
    padding: spacing['3'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: 'rgba(40, 26, 16, 0.10)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 2,
  },
  userBubbleMine: {
    backgroundColor: palette.brand.orange,
    borderColor: palette.brand.orange,
  },
  userBubbleAuthor: {
    ...typography.small,
    color: palette.ink.onDarkSoft,
    fontFamily: typography.bodyEmphasis.fontFamily,
    marginBottom: 2,
  },
  userBubbleText: {
    ...typography.body,
    fontSize: 13,
    color: palette.ink.onDarkStrong,
  },
  userBubbleTime: {
    ...typography.small,
    color: 'rgba(255,255,255,0.55)',
  },

  // Composer
  composerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingTop: spacing['2'],
    paddingBottom: spacing['3'],
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  composerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
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
  composerSend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.brand.orange,
  },
});
