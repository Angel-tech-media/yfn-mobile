import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, radius, spacing, typography } from '@/src/theme';

const ARTICLE = {
  title: 'Super Eagles draw shocks fans, jersey demand spikes 6x in Lagos',
  category: 'Sport',
  cover: ['#3a2818', '#1f1108'] as [string, string],
  author: {
    name: 'Tobi Ade',
    role: 'Sport correspondent',
    initial: 'T',
  },
  publishedAt: 'May 9, 2026',
  readMin: 4,
  claps: 1248,
  comments: 86,
  excerpt:
    "After the Super Eagles' 1-1 draw with Morocco at the Africa Cup of Nations qualifier, jersey orders in Ikoyi and Lekki surged six times the weekly average — and Vibe vendors who restocked early are reporting record sales.",
  paragraphs: [
    "The match itself was nothing to celebrate. A late equaliser from Hakim Ziyech turned what looked like a routine win into a draw that left fans across Nigeria torn between disappointment and defiance. But on Vibe's vendor dashboard, something else was happening.",
    'Within four hours of full-time, jersey listings tagged "Super Eagles" were viewed 41,000 times. By morning, six tailors in Ikoyi had sold out of their custom embroidery slots for the next two weeks.',
    'Aisha Threads, a Vibe-verified tailor with a small Victoria Island studio, said it was the busiest night her shop has had since the World Cup qualifiers. "I had to close orders by 1 AM. People were paying upfront, no negotiation."',
    "What's interesting is who was buying. Vibe's internal data showed a 22% lift in first-time buyers under 24 — the demographic the platform has been working hardest to court. Many of them came in through the Map tab after searching for \"jersey\" near them.",
    "For vendors watching the Insight tab, the signal was loud and early. Vibe's social-market AI flagged the trend as the match was still being played and pushed insight notifications to relevant vendors at the 70-minute mark, well before the wave of buyer searches arrived.",
  ],
  pullQuote:
    "I had to close orders by 1 AM. People were paying upfront, no negotiation.",
  inlineImage: ['#1f3a2c', '#0f1f17'] as [string, string],
  tags: ['SuperEagles', 'AFCON', 'Lagos', 'VendorInsight'],
};

const RELATED = [
  {
    id: 'r1',
    title: "Davido drops 'Timeless II' — merchandise pre-orders open",
    source: 'Vibe Music',
    age: '1h',
    cover: ['#3a1f2c', '#1f0e17'] as [string, string],
  },
  {
    id: 'r2',
    title: 'Detty December: how Lagos vendors are pricing experiences',
    source: 'Vibe Lifestyle',
    age: '3h',
    cover: ['#2c2c3a', '#15151f'] as [string, string],
  },
];

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [clapped, setClapped] = useState(false);
  const [saved, setSaved] = useState(false);

  void id;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <LinearGradient colors={ARTICLE.cover} style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroBar}>
            <Pressable
              onPress={() => router.back()}
              accessibilityLabel="Back"
              style={styles.heroIconBtn}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
              <Pressable
                onPress={() => setSaved((s) => !s)}
                accessibilityLabel="Save"
                style={styles.heroIconBtn}>
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color="#fff"
                />
              </Pressable>
              <Pressable accessibilityLabel="Share" style={styles.heroIconBtn}>
                <Ionicons name="share-outline" size={18} color="#fff" />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.heroFooter}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>{ARTICLE.category}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.headline}>{ARTICLE.title}</Text>

          {/* Author row — Medium style */}
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>{ARTICLE.author.initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{ARTICLE.author.name}</Text>
              <Text style={styles.authorMeta}>
                {ARTICLE.author.role} · {ARTICLE.publishedAt} ·{' '}
                {ARTICLE.readMin} min read
              </Text>
            </View>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          </View>

          {/* Inline action bar — claps + comments + bookmark + share */}
          <View style={styles.actionBar}>
            <Pressable
              onPress={() => setClapped((s) => !s)}
              style={styles.actionItem}>
              <Ionicons
                name={clapped ? 'heart' : 'heart-outline'}
                size={18}
                color={clapped ? palette.brand.orangeDeep : palette.ink.onLightSubtle}
              />
              <Text style={styles.actionCount}>
                {(ARTICLE.claps + (clapped ? 1 : 0)).toLocaleString()}
              </Text>
            </Pressable>
            <View style={styles.actionItem}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={palette.ink.onLightSubtle}
              />
              <Text style={styles.actionCount}>{ARTICLE.comments}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={() => setSaved((s) => !s)}
              accessibilityLabel="Save">
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={saved ? palette.brand.orange : palette.ink.onLightSubtle}
              />
            </Pressable>
            <Pressable accessibilityLabel="Share">
              <Ionicons
                name="share-outline"
                size={18}
                color={palette.ink.onLightSubtle}
              />
            </Pressable>
          </View>

          {/* Excerpt — italic lede */}
          <Text style={styles.excerpt}>{ARTICLE.excerpt}</Text>

          {ARTICLE.paragraphs.slice(0, 2).map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}

          {/* Pull quote */}
          <View style={styles.quote}>
            <View style={styles.quoteBar} />
            <Text style={styles.quoteText}>"{ARTICLE.pullQuote}"</Text>
          </View>

          {ARTICLE.paragraphs.slice(2, 4).map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}

          {/* Inline figure */}
          <LinearGradient colors={ARTICLE.inlineImage} style={styles.inlineImage}>
            <View style={styles.inlineImageOverlay}>
              <Ionicons name="image" size={28} color="rgba(255,255,255,0.4)" />
            </View>
          </LinearGradient>
          <Text style={styles.figcaption}>
            Lagos jersey vendors saw 6x the typical weekly demand within four hours
            of the final whistle.
          </Text>

          {ARTICLE.paragraphs.slice(4).map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}

          {/* Tags */}
          <View style={styles.tagsRow}>
            {ARTICLE.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>#{t}</Text>
              </View>
            ))}
          </View>

          {/* Author card */}
          <View style={styles.authorCard}>
            <View style={styles.authorAvatarLg}>
              <Text style={styles.authorInitialLg}>{ARTICLE.author.initial}</Text>
            </View>
            <Text style={styles.authorCardName}>
              Written by {ARTICLE.author.name}
            </Text>
            <Text style={styles.authorCardMeta}>
              {ARTICLE.author.role} at Vibe News · 2.4K followers
            </Text>
            <Pressable style={styles.authorFollow}>
              <Text style={styles.authorFollowText}>Follow</Text>
            </Pressable>
          </View>

          {/* Related */}
          <Text style={styles.sectionTitle}>More from Vibe</Text>
          {RELATED.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push(`/news/${r.id}` as never)}
              style={styles.relatedCard}>
              <LinearGradient colors={r.cover} style={styles.relatedThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.relatedHeadline} numberOfLines={3}>
                  {r.title}
                </Text>
                <Text style={styles.relatedMeta}>
                  {r.source} · {r.age} ago
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 60 },
  hero: { height: 280, justifyContent: 'space-between' },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFooter: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['4'],
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing['3'],
    height: 26,
    borderRadius: 999,
    backgroundColor: palette.brand.orange,
    justifyContent: 'center',
  },
  tagPillText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  body: { paddingHorizontal: spacing['5'], paddingTop: spacing['5'] },
  headline: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 30,
    lineHeight: 38,
    color: palette.ink.onLightStrong,
    marginBottom: spacing['4'],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.line.divider,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  authorName: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
  },
  authorMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: palette.ink.onLightStrong,
    justifyContent: 'center',
  },
  followText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: palette.line.divider,
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    fontFamily: typography.bodyEmphasis.fontFamily,
  },
  excerpt: {
    fontFamily: 'Manrope_400Regular',
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 28,
    color: palette.ink.onLightSubtle,
    marginTop: spacing['5'],
    marginBottom: spacing['4'],
  },
  paragraph: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 17,
    lineHeight: 28,
    color: palette.ink.onLightStrong,
    marginBottom: spacing['4'],
  },
  quote: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginVertical: spacing['3'],
    paddingVertical: spacing['2'],
  },
  quoteBar: {
    width: 3,
    backgroundColor: palette.brand.orange,
    borderRadius: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    lineHeight: 32,
    color: palette.ink.onLightStrong,
    fontStyle: 'italic',
  },
  inlineImage: {
    height: 220,
    marginVertical: spacing['4'],
    marginHorizontal: -spacing['5'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineImageOverlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  figcaption: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: -spacing['2'],
    marginBottom: spacing['5'],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['3'],
    marginBottom: spacing['5'],
  },
  tag: {
    paddingHorizontal: spacing['3'],
    height: 30,
    borderRadius: 999,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
  },
  tagText: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
  },
  authorCard: {
    paddingVertical: spacing['5'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing['5'],
  },
  authorAvatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.brand.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  authorInitialLg: {
    ...typography.h2,
    color: '#fff',
  },
  authorCardName: {
    ...typography.title,
    color: palette.ink.onLightStrong,
  },
  authorCardMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    textAlign: 'center',
  },
  authorFollow: {
    paddingHorizontal: spacing['5'],
    height: 36,
    borderRadius: 999,
    backgroundColor: palette.ink.onLightStrong,
    justifyContent: 'center',
    marginTop: spacing['2'],
  },
  authorFollowText: {
    ...typography.bodyEmphasis,
    color: '#fff',
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: palette.ink.onLightStrong,
    marginBottom: spacing['3'],
  },
  relatedCard: {
    flexDirection: 'row',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: palette.line.divider,
  },
  relatedThumb: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  relatedHeadline: {
    ...typography.bodyEmphasis,
    color: palette.ink.onLightStrong,
    fontSize: 15,
    lineHeight: 21,
  },
  relatedMeta: {
    ...typography.caption,
    color: palette.ink.onLightSubtle,
    marginTop: 4,
  },
});
